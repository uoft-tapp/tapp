import PropTypes from "prop-types";
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
import { actionFactory, validatedApiDispatcher } from "./utils";
import { apiGET, apiPOST } from "../../libs/api-utils";
import { postingsReducer } from "../reducers/postings";
import { activeRoleSelector } from "./users";
import { postingPositionsReducer } from "../reducers/posting_positions";

// actions
const fetchPostingsSuccess = actionFactory(FETCH_POSTINGS_SUCCESS);
const fetchOnePostingSuccess = actionFactory(FETCH_ONE_POSTING_SUCCESS);
const upsertOnePostingSuccess = actionFactory(UPSERT_ONE_POSTING_SUCCESS);
const deleteOnePostingSuccess = actionFactory(DELETE_ONE_POSTING_SUCCESS);

// PostingPosition actions
const fetchPostingPositionsSuccess = actionFactory(
    FETCH_POSTING_POSITIONS_SUCCESS
);
const fetchOnePostingPositionSuccess = actionFactory(
    FETCH_ONE_POSTING_POSITION_SUCCESS
);
const upsertOnePostingPositionSuccess = actionFactory(
    UPSERT_ONE_POSTING_POSITION_SUCCESS
);
const deleteOnePostingPositionSuccess = actionFactory(
    DELETE_ONE_POSTING_POSITION_SUCCESS
);

// dispatchers
export const fetchPostings = validatedApiDispatcher({
    name: "fetchPostings",
    description: "Fetch postings",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const role = activeRoleSelector(getState());
        const data = await apiGET(
            `/${role}/sessions/${activeSessionId}/postings`
        );
        await dispatch(fetchPostingsSuccess(data));
        return data;
    },
});

export const fetchPosting = validatedApiDispatcher({
    name: "fetchPosting",
    description: "Fetch posting",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(`/${role}/postings/${payload.id}`);
        dispatch(fetchOnePostingSuccess(data));
        return data;
    },
});

export const upsertPosting = validatedApiDispatcher({
    name: "upsertPosting",
    description: "Add/insert posting",
    propTypes: {},
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/${role}/sessions/${activeSessionId}/postings`,
            payload
        );
        dispatch(upsertOnePostingSuccess(data));
        return data;
    },
});

export const deletePosting = validatedApiDispatcher({
    name: "deletePosting",
    description: "Delete posting",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiPOST(`/${role}/postings/delete`, payload);
        dispatch(deleteOnePostingSuccess(data));
    },
});

// PostingPosition dispatchers
export const fetchPostingPositions = validatedApiDispatcher({
    name: "fetchPostingPositions",
    description: "Fetch posting_positions",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const role = activeRoleSelector(getState());
        const data = await apiGET(
            `/${role}/sessions/${activeSessionId}/posting_positions`
        );
        await dispatch(fetchPostingPositionsSuccess(data));
        return data;
    },
});

export const fetchPostingPosition = validatedApiDispatcher({
    name: "fetchPostingPosition",
    description: "Fetch posting_position",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(`/${role}/posting_positions/${payload.id}`);
        dispatch(fetchOnePostingPositionSuccess(data));
        return data;
    },
});

export const upsertPostingPosition = validatedApiDispatcher({
    name: "upsertPostingPosition",
    description: "Add/insert posting_position",
    propTypes: {},
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiPOST(`/${role}/posting_positions`, payload);
        dispatch(upsertOnePostingPositionSuccess(data));
        return data;
    },
});

export const deletePostingPosition = validatedApiDispatcher({
    name: "deletePostingPosition",
    description: "Delete posting_position",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiPOST(
            `/${role}/posting_positions/delete`,
            payload
        );
        dispatch(deleteOnePostingPositionSuccess(data));
    },
});

// selectors
const localStoreSelector = postingsReducer._localStoreSelector;
export const postingsSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData
);

const localStoreSelector2 = postingPositionsReducer._localStoreSelector;
export const postingPositionsSelector = createSelector(
    localStoreSelector2,
    (state) => state._modelData
);
