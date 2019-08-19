import PropTypes from "prop-types";
import { createSelector } from "reselect";
import {
    FETCH_SESSIONS_SUCCESS,
    FETCH_ONE_SESSION_SUCCESS,
    UPSERT_ONE_SESSION_SUCCESS,
    DELETE_ONE_SESSION_SUCCESS,
    SET_ACTIVE_SESSION
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    onActiveSessionChangeActions,
    validatedApiDispatcher
} from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";
import { sessionsReducer } from "../reducers/sessions";

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
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: () => async dispatch => {
        const data = await apiGET("/sessions");
        dispatch(fetchSessionsSuccess(data));
    }
});

export const fetchSession = validatedApiDispatcher({
    name: "fetchSession",
    description: "Fetch session",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: payload => async dispatch => {
        const data = await apiGET(`/sessions/${payload.id}`);
        dispatch(fetchOneSessionSuccess(data));
    }
});

export const upsertSession = validatedApiDispatcher({
    name: "upsertSession",
    description: "Add/insert session",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => upsertError(e.toString()),
    dispatcher: payload => async dispatch => {
        const data = await apiPOST(`/sessions`, payload);
        dispatch(upsertOneSessionSuccess(data));
    }
});

export const deleteSession = payload =>
    validatedApiDispatcher({
        name: "deleteSession",
        description: "Delete session",
        propTypes: { id: PropTypes.any.isRequired },
        onErrorDispatch: e => deleteError(e.toString()),
        dispatcher: async dispatch => {
            const data = await apiPOST(`/sessions/delete`, payload);
            dispatch(deleteOneSessionSuccess(data));
        }
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
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: true,
    dispatcher: payload => async (dispatch, getState) => {
        // Check to see if the active session is actually different. If it is, we will
        // trigger side-effects
        const state = getState();
        if (state.model.sessions.activeSession.id === payload.id) {
            return;
        }
        // If we made it here, the activeSession is changing.
        await dispatch(setActiveSessionAction(payload));
        // now that we have updated the active session, call all the dispatchers
        // who requested to be updated whenever the active session changes.
        // Save their return values so that we can await them after they're
        // dispatched. This way the browser can do parallel fetching.
        const promises = [];

        //eslint-disable-next-line
        for (const action of onActiveSessionChangeActions) {
            promises.push(dispatch(action()));
        }
        await Promise.all(promises);
    }
});

// selectors
export const localStoreSelector = sessionsReducer._localStoreSelector;
export const sessionsSelector = createSelector(
    localStoreSelector,
    state => state._modelData
);
export const activeSessionSelector = createSelector(
    localStoreSelector,
    state => state.activeSession
);
