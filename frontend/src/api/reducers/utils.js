/*
 * A set of utility functions to help with creating reducers
 */

import { combineReducers as _origCombineReducers } from "redux";
import { createReducer as _origCreateReducer } from "redux-create-reducer";

/**
 * Either updates the item `modelData`
 * with id == newItem.id, or appends it.
 *
 * @param {object} modelData
 * @param {object} newItem
 * @returns {object} An updated version of modelData
 */
export function upsertItem(modelData, newItem) {
    let didUpdate = false;
    const newModelData = modelData.map((item) => {
        if (item.id === newItem.id) {
            didUpdate = true;
            return newItem;
        }
        return item;
    });
    if (!didUpdate) {
        newModelData.push(newItem);
    }
    return newModelData;
}

/**
 * Create a basic reducer for the operations
 *   FETCH_MANY
 *   FETCH_ONE
 *   UPSERT_ONE
 *   DELETE_ONE
 * A basic reducer assumes that `state._modelData` is
 * an array and that each item in that array has an `id`
 * that can be used to determine upserts and deletes, etc..
 *
 * @param {string} FETCH_MANY
 * @param {string} FETCH_ONE
 * @param {string} UPSERT_ONE
 * @param {string} DELETE_ONE
 * @returns {object} An object of reducers suitable for passing to `createReducer`
 */
export function createBasicReducerObject(
    FETCH_MANY,
    FETCH_ONE,
    UPSERT_ONE,
    DELETE_ONE
) {
    return {
        [FETCH_MANY]: (state, action) => ({
            ...state,
            _modelData: action.payload,
        }),
        [FETCH_ONE]: (state, action) => ({
            ...state,
            _modelData: upsertItem(state._modelData, action.payload),
        }),
        [UPSERT_ONE]: (state, action) => ({
            ...state,
            _modelData: upsertItem(state._modelData, action.payload),
        }),
        [DELETE_ONE]: (state, action) => {
            const deletedItem = action.payload;
            return {
                ...state,
                _modelData: state._modelData.filter(
                    (item) => item.id !== deletedItem.id
                ),
            };
        },
    };
}

/**
 * Wraps "redux-create-reducer"'s version of `createReducer` to add
 * a `_storePath` attribute to the initial state and the reducer.
 * `_storePath` is used by `localStoreSelector` to return the local
 * state when passed in the global state. (For example, if
 *    `state = { a: b: localState }`, then `localStoreSelector(state) === localState`.)
 *
 * @param {object} initialState
 * @param {object} handlers
 * @returns
 */
export function createReducer(initialState, handlers) {
    const path = [];
    function pushToPath(dir) {
        path.unshift(dir);
    }
    // Every isolated state should have a unique id, so generate
    // a random one.
    const _storePath = { id: Math.random(), path, pushToPath };

    // add _storePath to the initial state and to the
    // new reducer
    initialState._storePath = _storePath;
    const reducer = _origCreateReducer(initialState, handlers);
    reducer._storePath = _storePath;

    // For convenience, attach a local store selector to the reducer
    reducer._localStoreSelector = createLocalStoreSelector(_storePath);

    return reducer;
}

/**
 * Search `state` for a local state in the location of `_storePath.path`.
 * For example, if `_storePath.path = ["a", "b"]`, this function will
 * return `state.a.b`.
 *
 * @param {object} state Redux state
 * @param {object} _storePath The `_storePath` object to use for searching `state`
 * @returns
 */
function _localStoreSelector(state, _storePath) {
    if (state._storePath && state._storePath.id === _storePath.id) {
        return state;
    }
    try {
        let localState = state;
        for (const dir of _storePath.path) {
            localState = localState[dir];
        }
        return localState;
    } catch (e) {
        // eslint-disable-next-line
        console.error(
            "Searching",
            state,
            "for local state with path",
            _storePath.join("."),
            "but encountered an error"
        );
    }
    return state;
}

/**
 * Create a selector that, when passed in the global redux state, will search
 * and return a local state based on the information in `_storePath`. This selector
 * can be passed either the local state or the global state. If it is passed the local
 * state, it checks that the `state._storePath.id` field matches `_storePath.id`;
 * if so, this selector immediately returns `state`. Otherwise, use `_storePath.path`
 * to search for the local state. For example, if `_storePath.path = ["a", "b"]`,
 * the returned selector will return `state.a.b`.
 *
 * @export
 * @param {object} _storePath
 * @param {array} _storePath.path The path to search in the redux state
 * @param {array} _storePath.id The unique id of the local state
 * @returns {Function} A selector that returns the local state (based on `_storePath`) when passed the global state
 */
export function createLocalStoreSelector(_storePath) {
    return (state) => _localStoreSelector(state, _storePath);
}

/**
 * Wraps "redux"'s `combineReducers` function so that `reducer._storePath.pushToPath`
 * is called on all child reducers.
 *
 * Redux's `combineReducers` function creates a new reducer from `model` that dispatches
 * actions to all reducers listed in `model`, but passes them an isolated part of the
 * store instead of passing in the full redux store as `state`. This is great for writing
 * reducers, but it makes things complicated for writing selectors, since, in general,
 * a selector will get passed the whole state, not the isolated part of the state that
 * `combineReducers` supplies. This wrapped version of `combineReducers` adds to a `path`
 * variable that is present in each reducer and which can be passed to a smart selector.
 *
 * @export
 * @param {object} model An object whose values are reducers
 * @returns {Function} A reducer
 */
export function combineReducers(model) {
    const pushToPathCallbacks = [];
    // recursively call all `pushToPath` functions.
    // They have been stored in `pushToPathCallbacks`
    function pushToPath(dir) {
        for (const func of pushToPathCallbacks) {
            func(dir);
        }
    }

    for (const [dir, reducer] of Object.entries(model)) {
        if (reducer._storePath) {
            reducer._storePath.pushToPath(dir);
            pushToPathCallbacks.push(reducer._storePath.pushToPath);
        }
    }

    const newReducer = _origCombineReducers(model);
    newReducer._storePath = { pushToPath };

    return newReducer;
}
