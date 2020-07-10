import PropTypes from "prop-types";
import {
    FETCH_APPLICANTS_SUCCESS,
    FETCH_ONE_APPLICANT_SUCCESS,
    UPSERT_ONE_APPLICANT_SUCCESS,
    DELETE_ONE_APPLICANT_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import { actionFactory, validatedApiDispatcher } from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";
import { applicantsReducer } from "../reducers/applicants";
import { createSelector } from "reselect";
import { activeRoleSelector } from "./users";
import { activeSessionSelector } from "./sessions";

// actions
const fetchApplicantsSuccess = actionFactory(FETCH_APPLICANTS_SUCCESS);
const fetchOneApplicantSuccess = actionFactory(FETCH_ONE_APPLICANT_SUCCESS);
const upsertOneApplicantSuccess = actionFactory(UPSERT_ONE_APPLICANT_SUCCESS);
const deleteOneApplicantSuccess = actionFactory(DELETE_ONE_APPLICANT_SUCCESS);

// dispatchers
export const fetchApplicants = validatedApiDispatcher({
    name: "fetchApplicants",
    description: "Fetch applicants",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        // When we fetch applicants, we only want the applicants associated with the current session
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(
            `/${role}/sessions/${activeSessionId}/applicants`
        );
        dispatch(fetchApplicantsSuccess(data));
        return data;
    },
});

export const fetchApplicant = validatedApiDispatcher({
    name: "fetchApplicant",
    description: "Fetch applicant",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(`/${role}/applicants/${payload.id}`);
        dispatch(fetchOneApplicantSuccess(data));
        return data;
    },
});

export const upsertApplicant = validatedApiDispatcher({
    name: "upsertApplicant",
    description: "Add/insert applicant",
    propTypes: {},
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload, bySession = true) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        let data;
        if (bySession) {
            const session = activeSessionSelector(getState());
            data = await apiPOST(
                `/${role}/sessions/${session.id}/applicants`,
                payload
            );
        } else {
            data = await apiPOST(`/${role}/applicants`, payload);
        }
        dispatch(upsertOneApplicantSuccess(data));
        return data;
    },
});

export const deleteApplicant = validatedApiDispatcher({
    name: "deleteApplicant",
    description: "Delete applicant",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/${role}/sessions/${activeSessionId}/applicants/delete`,
            payload
        );
        dispatch(deleteOneApplicantSuccess(data));
    },
});

export const exportApplicants = validatedApiDispatcher({
    name: "exportApplicants",
    description: "Export applicants",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (formatter, format = "spreadsheet") => async (
        dispatch,
        getState
    ) => {
        if (!(formatter instanceof Function)) {
            throw new Error(
                `"formatter" must be a function when using the export action.`
            );
        }
        // Re-fetch all applicants from the server in case things happened to be out of sync.
        await dispatch(fetchApplicants());
        const applicants = applicantsSelector(getState());

        return formatter(applicants, format);
    },
});

export const upsertApplicants = validatedApiDispatcher({
    name: "upsertApplicants",
    description: "Upsert applicants",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (applicants) => async (dispatch) => {
        if (applicants.length === 0) {
            return;
        }
        const dispatchers = applicants.map((applicant) =>
            dispatch(upsertApplicant(applicant))
        );
        await Promise.all(dispatchers);
        // Re-fetch all applicants from the server in case things happened to be out of sync.
        return await dispatch(fetchApplicants());
    },
});

// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
export const localStoreSelector = applicantsReducer._localStoreSelector;
export const applicantsSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData
);
