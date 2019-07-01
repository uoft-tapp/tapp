import uuid from "uuid-random";
import {
    FETCH_SESSIONS_SUCCESS,
    FETCH_ONE_SESSION_SUCCESS,
    UPSERT_ONE_SESSION_SUCCESS,
    DELETE_ONE_SESSION_SUCCESS,
    SET_ACTIVE_SESSION
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import { apiInteractionStart, apiInteractionEnd } from "./status";
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
    const statusId = uuid();
    dispatch(apiInteractionStart(statusId, "Fetching sessions"));
    try {
        const data = await apiGET("/sessions");
        dispatch(fetchSessionsSuccess(data));
    } catch (e) {
        dispatch(fetchError(e.toString()));
    } finally {
        dispatch(apiInteractionEnd(statusId));
    }
};

export const fetchSession = payload => async dispatch => {
    if (payload == null || payload.id == null) {
        dispatch(fetchError("Tried to fetch a session, but `{id: null}`"));
        return;
    }
    const statusId = uuid();
    dispatch(apiInteractionStart(statusId, "Fetching session"));
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
    const statusId = uuid();
    dispatch(apiInteractionStart(statusId, "Updating/inserting session"));
    try {
        const data = await apiPOST(`/sessions`, payload);
        dispatch(upsertOneSessionSuccess(data));
    } catch (e) {
        dispatch(upsertError(e.toString()));
    } finally {
        dispatch(apiInteractionEnd(statusId));
    }
};

export const deleteSession = payload => async dispatch => {
    if (payload == null || payload.id == null) {
        dispatch(deleteError("Tried to delete a session, but `{id: null}`"));
        return;
    }
    const statusId = uuid();
    dispatch(apiInteractionStart(statusId, "Deleting session"));
    try {
        const data = await apiPOST(`/sessions/delete`, payload);
        dispatch(deleteOneSessionSuccess(data));
    } catch (e) {
        dispatch(deleteError(e.toString()));
    } finally {
        dispatch(apiInteractionEnd(statusId));
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
    const statusId = uuid();
    dispatch(apiInteractionStart(statusId, "Setting active session"));
    try {
        await dispatch(setActiveSessionAction(payload));
        // now that we have updated the active session, call all the dispatchers
        // who requested to be updated whenever the active session changes.
        // Save their return values so that we can await them after they're
        // dispatched. This way the browser can do parallel fetching.
        const promises = [];
        for (const action of onActiveSessionChangeActions) {
            promises.push(dispatch(action()));
        }
        await Promise.all(promises);
        /* eslint-disable no-useless-catch */
    } catch (e) {
        /* eslint-enable no-useless-catch */
        // we catch and throw the same error because
        // we want the `finally` block to run regardless of
        // what happens.
        throw e;
    } finally {
        dispatch(apiInteractionEnd(statusId));
    }
};

// selectors
export const sessionsSelector = state => state._modelData;
