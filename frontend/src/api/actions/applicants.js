import PropTypes from "prop-types";
import {
    FETCH_APPLICANTS_SUCCESS,
    FETCH_ONE_APPLICANT_SUCCESS,
    UPSERT_ONE_APPLICANT_SUCCESS,
    DELETE_ONE_APPLICANT_SUCCESS
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    runOnActiveSessionChange,
    validatedApiDispatcher
} from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";
import { applicantsReducer } from "../reducers/applicants";
import { createSelector } from "reselect";

// actions
const fetchApplicantsSuccess = actionFactory(FETCH_APPLICANTS_SUCCESS);
const fetchOneApplicantSuccess = actionFactory(FETCH_ONE_APPLICANT_SUCCESS);
const upsertOneApplicantSuccess = actionFactory(UPSERT_ONE_APPLICANT_SUCCESS);
const deleteOneApplicantSuccess = actionFactory(DELETE_ONE_APPLICANT_SUCCESS);

// dispatchers
export const fetchApplicants = validatedApiDispatcher({
    name: "fetchApplicants",
    description: "Fetch applicants",
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(`/sessions/${activeSessionId}/applicants`);
        dispatch(fetchApplicantsSuccess(data));
    }
});

export const fetchApplicant = validatedApiDispatcher({
    name: "fetchApplicant",
    description: "Fetch applicant",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(
            `/sessions/${activeSessionId}/applicants/${payload.id}`
        );
        dispatch(fetchOneApplicantSuccess(data));
    }
});

export const upsertApplicant = validatedApiDispatcher({
    name: "upsertApplicant",
    description: "Add/insert applicant",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => upsertError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/sessions/${activeSessionId}/applicants`,
            payload
        );
        dispatch(upsertOneApplicantSuccess(data));
    }
});

export const deleteApplicant = validatedApiDispatcher({
    name: "deleteApplicant",
    description: "Delete applicant",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => deleteError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/sessions/${activeSessionId}/applicants/delete`,
            payload
        );
        dispatch(deleteOneApplicantSuccess(data));
    }
});

// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
export const localStoreSelector = applicantsReducer._localStoreSelector;
export const applicantsSelector = createSelector(
    localStoreSelector,
    state => state._modelData
);

// Any time the active session changes, we want to refetch
// all data. Calling `runOnActiveSessionChange` ensures that
// when the active session changes all data is re-fetched
runOnActiveSessionChange(fetchApplicants);
