import {
    FETCH_SESSIONS_SUCCESS,
    FETCH_ONE_SESSION_SUCCESS,
    UPSERT_ONE_SESSION_SUCCESS,
    DELETE_ONE_SESSION_SUCCESS,
    SET_ACTIVE_SESSION
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import { actionFactory, onActiveSessionChangeActions } from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";

// actions
const fetchSessionsSuccess = actionFactory(FETCH_SESSIONS_SUCCESS);
const fetchOneSessionSuccess = actionFactory(FETCH_ONE_SESSION_SUCCESS);
const upsertOneSessionSuccess = actionFactory(UPSERT_ONE_SESSION_SUCCESS);
const deleteOneSessionSuccess = actionFactory(DELETE_ONE_SESSION_SUCCESS);
const setActiveSessionAction = actionFactory(SET_ACTIVE_SESSION);

// dispatchers
export const fetchSessions = () => async dispatch => {
    try {
        const data = await apiGET("/sessions");
        dispatch(fetchSessionsSuccess(data));
    } catch (e) {
        dispatch(fetchError(e.toString()));
    }
};

export const fetchSession = payload => async dispatch => {
    if (payload == null || payload.id == null) {
        dispatch(fetchError("Tried to fetch a session, but `{id: null}`"));
        return;
    }
    try {
        const data = await apiGET(`/sessions/${payload.id}`);
        dispatch(fetchOneSessionSuccess(data));
    } catch (e) {
        dispatch(fetchError(e.toString()));
    }
};

export const upsertSession = payload => async dispatch => {
    if (payload == null || payload.id == null) {
        dispatch(upsertError("Tried to upsert a session, but `{id: null}`"));
        return;
    }
    try {
        const data = await apiPOST(`/sessions`, payload);
        dispatch(upsertOneSessionSuccess(data));
    } catch (e) {
        dispatch(upsertError(e.toString()));
    }
};

export const deleteSession = payload => async dispatch => {
    if (payload == null || payload.id == null) {
        dispatch(deleteError("Tried to delete a session, but `{id: null}`"));
        return;
    }
    try {
        const data = await apiPOST(`/sessions/delete`, payload);
        dispatch(deleteOneSessionSuccess(data));
    } catch (e) {
        dispatch(deleteError(e.toString()));
    }
};

/**
 * Sets the `activeSession`. `activeSession` is used
 * in other API calls, so changing the active session may
 * trigger changes in other data (for example, `instructors` or `positions`)
 *
 * @param {object} payload - The session to set active
 */
export const setActiveSession = payload => async (dispatch, getState) => {
    if (payload == null || payload.id == null) {
        dispatch(
            deleteError(
                "Cannot set the active session to a session with `{id: null}`"
            )
        );
        return;
    }
    // Check to see if the active session is actually different. If it is, we will
    // trigger side-effects
    const state = getState();
    if (state.model.sessions.activeSession.id === payload.id) {
        return;
    }
    // If we made it here, the activeSession is changing.

    await dispatch(setActiveSessionAction(payload));
    // now that we have updated the active session, call all the dispatchers
    // who requested to be updated whenever the active session changes
    for (const action of onActiveSessionChangeActions) {
        dispatch(action());
    }
};

// selectors
export const sessionsSelector = state => state._modelData;
