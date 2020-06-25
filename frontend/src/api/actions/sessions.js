import PropTypes from "prop-types";
import { createSelector } from "reselect";
import {
    FETCH_SESSIONS_SUCCESS,
    FETCH_ONE_SESSION_SUCCESS,
    UPSERT_ONE_SESSION_SUCCESS,
    DELETE_ONE_SESSION_SUCCESS,
    SET_ACTIVE_SESSION,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import { actionFactory, validatedApiDispatcher } from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";
import { sessionsReducer } from "../reducers/sessions";
import { activeRoleSelector } from "./users";
import { initFromStage } from "./init";

// actions
const fetchSessionsSuccess = actionFactory(FETCH_SESSIONS_SUCCESS);
const fetchOneSessionSuccess = actionFactory(FETCH_ONE_SESSION_SUCCESS);
const upsertOneSessionSuccess = actionFactory(UPSERT_ONE_SESSION_SUCCESS);
const deleteOneSessionSuccess = actionFactory(DELETE_ONE_SESSION_SUCCESS);
const setActiveSessionAction = actionFactory(SET_ACTIVE_SESSION);

// dispatchers
export const fetchSessions = validatedApiDispatcher({
    name: "fetchSessions",
    description: "Fetch sessions",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(`/${role}/sessions`);
        await dispatch(fetchSessionsSuccess(data));
    },
});

export const fetchSession = validatedApiDispatcher({
    name: "fetchSession",
    description: "Fetch session",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(`/${role}/sessions/${payload.id}`);
        dispatch(fetchOneSessionSuccess(data));
    },
});

export const upsertSession = validatedApiDispatcher({
    name: "upsertSession",
    description: "Add/insert session",
    propTypes: {},
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiPOST(`/${role}/sessions`, payload);
        dispatch(upsertOneSessionSuccess(data));
    },
});

export const deleteSession = (payload) =>
    validatedApiDispatcher({
        name: "deleteSession",
        description: "Delete session",
        propTypes: { id: PropTypes.any.isRequired },
        onErrorDispatch: (e) => deleteError(e.toString()),
        dispatcher: async (dispatch, getState) => {
            const role = activeRoleSelector(getState());
            const data = await apiPOST(`/${role}/sessions/delete`, payload);
            dispatch(deleteOneSessionSuccess(data));
        },
    });

/**
 * Sets the `activeSession`. `activeSession` is used
 * in other API calls, so changing the active session may
 * trigger changes in other data (for example, `instructors` or `positions`)
 *
 * @param {object} payload - The session to set active
 */
export const setActiveSession = validatedApiDispatcher({
    name: "setActiveSession",
    description: "Set the active session",
    onErrorDispatch: true,
    dispatcher: (payload, options = {}) => async (dispatch, getState) => {
        const { skipInit } = options;
        const state = getState();
        const currentActiveSession = activeSessionSelector(state);
        if (currentActiveSession === payload) {
            return;
        }
        // passing in null will unset the active session
        if (payload == null) {
            await dispatch(setActiveSessionAction(null));
            return;
        }
        if ((currentActiveSession || { id: null }).id === payload.id) {
            return;
        }
        // If we made it here, the activeSession is changing.
        await dispatch(setActiveSessionAction(payload));
        // Make sure all tasks we depend on get run
        if (!skipInit) {
            await dispatch(
                initFromStage("setActiveSession", { startAfterStage: true })
            );
        }
    },
});

// selectors
export const localStoreSelector = sessionsReducer._localStoreSelector;
export const sessionsSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData
);
export const activeSessionSelector = createSelector(
    localStoreSelector,
    (state) => state.activeSession
);
