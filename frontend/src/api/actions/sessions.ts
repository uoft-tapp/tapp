import { createSelector } from "reselect";
import {
    FETCH_SESSIONS_SUCCESS,
    FETCH_ONE_SESSION_SUCCESS,
    UPSERT_ONE_SESSION_SUCCESS,
    DELETE_ONE_SESSION_SUCCESS,
    SET_ACTIVE_SESSION,
} from "../constants";
import { fetchError, upsertError, deleteError, apiError } from "./errors";
import { actionFactory, HasId, validatedApiDispatcher } from "./utils";
import { apiGET, apiPOST } from "../../libs/api-utils";
import { sessionsReducer } from "../reducers/sessions";
import { activeRoleSelector } from "./users";
import { clearSessionDependentData, initFromStage } from "./init";
import type { RawSession, Session } from "../defs/types";

// actions
export const fetchSessionsSuccess = actionFactory<RawSession[]>(
    FETCH_SESSIONS_SUCCESS
);
const fetchOneSessionSuccess = actionFactory<RawSession>(
    FETCH_ONE_SESSION_SUCCESS
);
const upsertOneSessionSuccess = actionFactory<RawSession>(
    UPSERT_ONE_SESSION_SUCCESS
);
const deleteOneSessionSuccess = actionFactory<RawSession>(
    DELETE_ONE_SESSION_SUCCESS
);
const setActiveSessionAction = actionFactory<RawSession | null>(
    SET_ACTIVE_SESSION
);

// dispatchers
export const fetchSessions = validatedApiDispatcher({
    name: "fetchSessions",
    description: "Fetch sessions",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        try {
            const role = activeRoleSelector(getState());
            const data = (await apiGET(`/${role}/sessions`)) as RawSession[];
            dispatch(fetchSessionsSuccess(data));
            return data;
        } catch (e) {
            dispatch(fetchSessionsSuccess([]));
            return [];
        }
    },
});

export const fetchSession = validatedApiDispatcher({
    name: "fetchSession",
    description: "Fetch session",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/sessions/${payload.id}`
        )) as RawSession;
        dispatch(fetchOneSessionSuccess(data));
        return data;
    },
});

export const upsertSession = validatedApiDispatcher({
    name: "upsertSession",
    description: "Add/insert session",
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload: Partial<Session>) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiPOST(
            `/${role}/sessions`,
            payload
        )) as RawSession;
        dispatch(upsertOneSessionSuccess(data));
        return data;
    },
});

export const deleteSession = validatedApiDispatcher({
    name: "deleteSession",
    description: "Delete session",
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload: Partial<Session>) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiPOST(
            `/${role}/sessions/delete`,
            payload
        )) as RawSession;
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
    onErrorDispatch: (e) => apiError(e.toString()),
    dispatcher: (
        payload: Session | null,
        options: { skipInit?: boolean } = {}
    ) => async (dispatch, getState) => {
        const { skipInit } = options;
        const state = getState();
        const currentActiveSession = activeSessionSelector(state);
        if (currentActiveSession === payload) {
            return;
        }
        // passing in null will unset the active session
        if (payload == null) {
            dispatch(setActiveSessionAction(null));
            dispatch(clearSessionDependentData());
            return;
        }
        if ((currentActiveSession || { id: null }).id === payload.id) {
            return;
        }
        // If we made it here, the activeSession is changing.
        dispatch(setActiveSessionAction(payload));
        // Make sure all tasks we depend on get run
        if (!skipInit) {
            await dispatch(
                initFromStage("setActiveSession", { startAfterStage: true })
            );
        }
    },
});

// selectors
const localStoreSelector = sessionsReducer._localStoreSelector;
export const sessionsSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData as Session[]
);
export const activeSessionSelector = createSelector(
    localStoreSelector,
    (state) => state.activeSession as Session | null
);
