import { createSelector } from "reselect";
import {
    FETCH_POSTINGS_SUCCESS,
    FETCH_ONE_POSTING_SUCCESS,
    UPSERT_ONE_POSTING_SUCCESS,
    DELETE_ONE_POSTING_SUCCESS,
    FETCH_POSTING_POSITIONS_SUCCESS,
    FETCH_ONE_POSTING_POSITION_SUCCESS,
    UPSERT_ONE_POSTING_POSITION_SUCCESS,
    DELETE_ONE_POSTING_POSITION_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import { actionFactory, HasId, validatedApiDispatcher } from "./utils";
import { apiGET, apiPOST } from "../../libs/api-utils";
import { postingsReducer } from "../reducers/postings";
import { activeRoleSelector } from "./users";
import { postingPositionsReducer } from "../reducers/posting_positions";
import type { Posting, PostingPosition, RawPosting, RawPostingPosition } from "../defs/types";

// actions
const fetchPostingsSuccess = actionFactory<RawPosting[]>(
    FETCH_POSTINGS_SUCCESS
);
const fetchOnePostingSuccess = actionFactory<RawPosting>(
    FETCH_ONE_POSTING_SUCCESS
);
const upsertOnePostingSuccess = actionFactory<RawPosting>(
    UPSERT_ONE_POSTING_SUCCESS
);
const deleteOnePostingSuccess = actionFactory<RawPosting>(
    DELETE_ONE_POSTING_SUCCESS
);

// PostingPosition actions
const fetchPostingPositionsSuccess = actionFactory<RawPostingPosition[]>(
    FETCH_POSTING_POSITIONS_SUCCESS
);
const fetchOnePostingPositionSuccess = actionFactory<RawPostingPosition>(
    FETCH_ONE_POSTING_POSITION_SUCCESS
);
const upsertOnePostingPositionSuccess = actionFactory<RawPostingPosition>(
    UPSERT_ONE_POSTING_POSITION_SUCCESS
);
const deleteOnePostingPositionSuccess = actionFactory<RawPostingPosition>(
    DELETE_ONE_POSTING_POSITION_SUCCESS
);

// dispatchers
export const fetchPostings = validatedApiDispatcher({
    name: "fetchPostings",
    description: "Fetch postings",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const activeSession = getState().model.sessions.activeSession;
        if (activeSession == null) {
            throw new Error("Cannot fetch Postings without an active session");
        }
        const { id: activeSessionId } = activeSession;
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/sessions/${activeSessionId}/postings`
        )) as RawPosting[];
        dispatch(fetchPostingsSuccess(data));
        return data;
    },
});

export const fetchPosting = validatedApiDispatcher({
    name: "fetchPosting",
    description: "Fetch posting",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/postings/${payload.id}`
        )) as RawPosting;
        dispatch(fetchOnePostingSuccess(data));
        return data;
    },
});

export const upsertPosting = validatedApiDispatcher({
    name: "upsertPosting",
    description: "Add/insert posting",
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload: Partial<RawPosting>) => async (
        dispatch,
        getState
    ) => {
        const role = activeRoleSelector(getState());
        const activeSession = getState().model.sessions.activeSession;
        if (activeSession == null) {
            throw new Error("Cannot fetch Postings without an active session");
        }
        const { id: activeSessionId } = activeSession;
        const data = (await apiPOST(
            `/${role}/sessions/${activeSessionId}/postings`,
            payload
        )) as RawPosting;
        dispatch(upsertOnePostingSuccess(data));
        return data;
    },
});

export const deletePosting = validatedApiDispatcher({
    name: "deletePosting",
    description: "Delete posting",
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiPOST(
            `/${role}/postings/delete`,
            payload
        )) as RawPosting;
        dispatch(deleteOnePostingSuccess(data));
    },
});

// PostingPosition dispatchers
export const fetchPostingPositions = validatedApiDispatcher({
    name: "fetchPostingPositions",
    description: "Fetch posting_positions",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const activeSession = getState().model.sessions.activeSession;
        if (activeSession == null) {
            throw new Error(
                "Cannot fetch PostingPositions without an active session"
            );
        }
        const { id: activeSessionId } = activeSession;
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/sessions/${activeSessionId}/posting_positions`
        )) as RawPostingPosition[];
        dispatch(fetchPostingPositionsSuccess(data));
        return data;
    },
});

export const fetchPostingPosition = validatedApiDispatcher({
    name: "fetchPostingPosition",
    description: "Fetch posting_position",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/posting_positions/${payload.id}`
        )) as RawPostingPosition;
        dispatch(fetchOnePostingPositionSuccess(data));
        return data;
    },
});

export const upsertPostingPosition = validatedApiDispatcher({
    name: "upsertPostingPosition",
    description: "Add/insert posting_position",
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload: Partial<RawPostingPosition>) => async (
        dispatch,
        getState
    ) => {
        const role = activeRoleSelector(getState());
        const data = (await apiPOST(
            `/${role}/posting_positions`,
            payload
        )) as RawPostingPosition;
        dispatch(upsertOnePostingPositionSuccess(data));
        return data;
    },
});

export const deletePostingPosition = validatedApiDispatcher({
    name: "deletePostingPosition",
    description: "Delete posting_position",
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (
        payload: Pick<RawPostingPosition, "position_id" | "posting_id">
    ) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiPOST(
            `/${role}/posting_positions/delete`,
            payload
        )) as RawPostingPosition;
        dispatch(deleteOnePostingPositionSuccess(data));
    },
});

// selectors
const localStoreSelector = postingsReducer._localStoreSelector;
export const postingsSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData as Posting[]
);

const localStoreSelector2 = postingPositionsReducer._localStoreSelector;
export const postingPositionsSelector = createSelector(
    localStoreSelector2,
    (state) => (state._modelData as unknown) as PostingPosition[]
);
