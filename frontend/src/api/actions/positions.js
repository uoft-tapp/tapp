import uuid from "uuid-random";
import {
    FETCH_POSITIONS_SUCCESS,
    FETCH_ONE_POSITION_SUCCESS,
    UPSERT_ONE_POSITION_SUCCESS,
    DELETE_ONE_POSITION_SUCCESS
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import { apiInteractionStart, apiInteractionEnd } from "./status";
import { actionFactory, runOnActiveSessionChange } from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";

// actions
const fetchPositionsSuccess = actionFactory(FETCH_POSITIONS_SUCCESS);
const fetchOnePositionSuccess = actionFactory(FETCH_ONE_POSITION_SUCCESS);
const upsertOnePositionSuccess = actionFactory(UPSERT_ONE_POSITION_SUCCESS);
const deleteOnePositionSuccess = actionFactory(DELETE_ONE_POSITION_SUCCESS);

// dispatchers
export const fetchPositions = () => async (dispatch, getState) => {
    const { id: activeSessionId } = getState().model.sessions.activeSession;
    const statusId = uuid();
    dispatch(apiInteractionStart(statusId, "Fetching positions"));
    try {
        const data = await apiGET(`/sessions/${activeSessionId}/positions`);
        dispatch(fetchPositionsSuccess(data));
    } catch (e) {
        dispatch(fetchError(e.toString()));
    } finally {
        dispatch(apiInteractionEnd(statusId));
    }
};

export const fetchPosition = payload => async (dispatch, getState) => {
    if (payload == null || payload.id == null) {
        dispatch(fetchError("Tried to fetch a session, but `{id: null}`"));
        return;
    }
    const { id: activeSessionId } = getState().model.sessions.activeSession;
    const statusId = uuid();
    dispatch(apiInteractionStart(statusId, "Fetching position"));
    try {
        const data = await apiGET(
            `/sessions/${activeSessionId}/positions/${payload.id}`
        );
        dispatch(fetchOnePositionSuccess(data));
    } catch (e) {
        dispatch(fetchError(e.toString()));
    } finally {
        dispatch(apiInteractionEnd(statusId));
    }
};

export const upsertPosition = payload => async (dispatch, getState) => {
    if (payload == null || payload.id == null) {
        dispatch(upsertError("Tried to upsert a session, but `{id: null}`"));
        return;
    }
    const { id: activeSessionId } = getState().model.sessions.activeSession;
    const statusId = uuid();
    dispatch(apiInteractionStart(statusId, "Updating/inserting position"));
    try {
        const data = await apiPOST(
            `/sessions/${activeSessionId}/positions`,
            payload
        );
        dispatch(upsertOnePositionSuccess(data));
    } catch (e) {
        dispatch(upsertError(e.toString()));
    } finally {
        dispatch(apiInteractionEnd(statusId));
    }
};

export const deletePosition = payload => async (dispatch, getState) => {
    if (payload == null || payload.id == null) {
        dispatch(deleteError("Tried to delete a session, but `{id: null}`"));
        return;
    }
    const { id: activeSessionId } = getState().model.sessions.activeSession;
    const statusId = uuid();
    dispatch(apiInteractionStart(statusId, "Deleting position"));
    try {
        const data = await apiPOST(
            `/sessions/${activeSessionId}/positions/delete`,
            payload
        );
        dispatch(deleteOnePositionSuccess(data));
    } catch (e) {
        dispatch(deleteError(e.toString()));
    } finally {
        dispatch(apiInteractionEnd(statusId));
    }
};

// selectors
export const positionsSelector = state => state._modelData;

// Any time the active session changes, we want to refetch
// all data. Calling `runOnActiveSessionChange` ensures that
// when the active session changes all data is re-fetched
runOnActiveSessionChange(fetchPositions);
