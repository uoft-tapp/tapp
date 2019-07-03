/*
 * A set of utility functions to help with creating reducers
 */

/**
 * Either updates the item `modelData`
 * with id == newItem.id, or appends it.
 *
 * @param {object} modelData
 * @param {object} newItem
 * @returns {object} An updated version of modelData
 */
function upsertItem(modelData, newItem) {
    let didUpdate = false;
    const newModelData = modelData.map(item => {
        if (item.id === newItem.id) {
            didUpdate = 1;
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
function createBasicReducerObject(
    FETCH_MANY,
    FETCH_ONE,
    UPSERT_ONE,
    DELETE_ONE
) {
    return {
        [FETCH_MANY]: (state, action) => ({
            ...state,
            _modelData: action.payload
        }),
        [FETCH_ONE]: (state, action) => ({
            ...state,
            _modelData: upsertItem(state._modelData, action.payload)
        }),
        [UPSERT_ONE]: (state, action) => ({
            ...state,
            _modelData: upsertItem(state._modelData, action.payload)
        }),
        [DELETE_ONE]: (state, action) => {
            const deletedItem = action.payload;
            return {
                ...state,
                _modelData: state._modelData.filter(
                    item => item.id !== deletedItem.id
                )
            };
        }
    };
}

export { createBasicReducerObject, upsertItem };
