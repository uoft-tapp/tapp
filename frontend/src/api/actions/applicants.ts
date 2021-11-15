import {
    FETCH_APPLICANTS_SUCCESS,
    FETCH_ONE_APPLICANT_SUCCESS,
    UPSERT_ONE_APPLICANT_SUCCESS,
    DELETE_ONE_APPLICANT_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import { actionFactory, HasId, validatedApiDispatcher } from "./utils";
import { apiGET, apiPOST } from "../../libs/api-utils";
import { applicantsReducer } from "../reducers/applicants";
import { createSelector } from "reselect";
import { activeRoleSelector } from "./users";
import { activeSessionSelector } from "./sessions";
import { Applicant, RawApplicant } from "../defs/types";
import { ExportFormat, PrepareDataFunc } from "../../libs/import-export";

// actions
export const fetchApplicantsSuccess = actionFactory<RawApplicant[]>(
    FETCH_APPLICANTS_SUCCESS
);
const fetchOneApplicantSuccess = actionFactory<RawApplicant>(
    FETCH_ONE_APPLICANT_SUCCESS
);
const upsertOneApplicantSuccess = actionFactory<RawApplicant>(
    UPSERT_ONE_APPLICANT_SUCCESS
);
const deleteOneApplicantSuccess = actionFactory<RawApplicant>(
    DELETE_ONE_APPLICANT_SUCCESS
);

// dispatchers
export const fetchApplicants = validatedApiDispatcher({
    name: "fetchApplicants",
    description: "Fetch applicants",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        // When we fetch applicants, we only want the applicants associated with the current session
        const activeSession = activeSessionSelector(getState());
        if (activeSession == null) {
            throw new Error("Cannot fetch DDAHs without an active session");
        }
        const { id: activeSessionId } = activeSession;
        const data = (await apiGET(
            `/${role}/sessions/${activeSessionId}/applicants`
        )) as RawApplicant[];
        dispatch(fetchApplicantsSuccess(data));
        return data;
    },
});

export const fetchApplicant = validatedApiDispatcher({
    name: "fetchApplicant",
    description: "Fetch applicant",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/applicants/${payload.id}`
        )) as RawApplicant;
        dispatch(fetchOneApplicantSuccess(data));
        return data;
    },
});

export const upsertApplicant = validatedApiDispatcher({
    name: "upsertApplicant",
    description: "Add/insert applicant",
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher:
        (payload: Partial<Applicant>, bySession: boolean = true) =>
        async (dispatch, getState) => {
            const role = activeRoleSelector(getState());
            let data: RawApplicant;
            if (bySession) {
                const activeSession = activeSessionSelector(getState());
                if (activeSession == null) {
                    throw new Error(
                        "Cannot fetch DDAHs without an active session"
                    );
                }
                const { id: activeSessionId } = activeSession;
                data = await apiPOST(
                    `/${role}/sessions/${activeSessionId}/applicants`,
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
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiPOST(
            `/${role}/applicants/delete`,
            payload
        )) as RawApplicant;
        dispatch(deleteOneApplicantSuccess(data));
        return data;
    },
});

export const exportApplicants = validatedApiDispatcher({
    name: "exportApplicants",
    description: "Export applicants",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher:
        (
            formatter: PrepareDataFunc<Applicant>,
            format: ExportFormat = "spreadsheet"
        ) =>
        async (dispatch, getState) => {
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
    dispatcher: (applicants: Partial<Applicant>[]) => async (dispatch) => {
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
const localStoreSelector = applicantsReducer._localStoreSelector;
export const applicantsSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData as Applicant[]
);
