import {
    FETCH_APPLICATIONS_SUCCESS,
    FETCH_ONE_APPLICATION_SUCCESS,
    UPSERT_ONE_APPLICATION_SUCCESS,
    DELETE_ONE_APPLICATION_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    arrayToHash,
    validatedApiDispatcher,
    flattenIdFactory,
    HasId,
} from "./utils";
import { apiGET, apiPOST } from "../../libs/api-utils";
import { applicationsReducer } from "../reducers/applications";
import { createSelector } from "reselect";
import { applicantsSelector, fetchApplicants } from "./applicants";
import { activeRoleSelector } from "./users";
import type { Application, RawApplication } from "../defs/types";
import { activeSessionSelector } from "./sessions";
import { fetchPostings, postingsSelector } from "./postings";
import { positionsSelector } from "./positions";
import { ExportFormat, PrepareDataFunc } from "../../libs/import-export";

// actions
export const fetchApplicationsSuccess = actionFactory<RawApplication[]>(
    FETCH_APPLICATIONS_SUCCESS
);
const fetchOneApplicationSuccess = actionFactory<RawApplication>(
    FETCH_ONE_APPLICATION_SUCCESS
);
const upsertOneApplicationSuccess = actionFactory<RawApplication>(
    UPSERT_ONE_APPLICATION_SUCCESS
);
const deleteOneApplicationSuccess = actionFactory<RawApplication>(
    DELETE_ONE_APPLICATION_SUCCESS
);

const applicantToApplicantId = flattenIdFactory<"applicant", "applicant_id">(
    "applicant",
    "applicant_id"
);

function prepApplicationForApi(data: Partial<Application>) {
    return applicantToApplicantId(data as any);
}

// dispatchers
export const fetchApplications = validatedApiDispatcher({
    name: "fetchApplications",
    description: "Fetch applications",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const activeSession = activeSessionSelector(getState());
        if (activeSession == null) {
            throw new Error(
                "Cannot fetch Applications without an active session"
            );
        }
        const { id: activeSessionId } = activeSession;
        const data = (await apiGET(
            `/${role}/sessions/${activeSessionId}/applications`
        )) as RawApplication[];
        dispatch(fetchApplicationsSuccess(data));
        return data;
    },
});

export const fetchApplication = validatedApiDispatcher({
    name: "fetchApplication",
    description: "Fetch application",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const activeSession = activeSessionSelector(getState());
        if (activeSession == null) {
            throw new Error(
                "Cannot fetch Applications without an active session"
            );
        }
        const { id: activeSessionId } = activeSession;
        const data = (await apiGET(
            `/${role}/sessions/${activeSessionId}/applications/${payload.id}`
        )) as RawApplication;
        dispatch(fetchOneApplicationSuccess(data));
        return data;
    },
});

export const upsertApplication = validatedApiDispatcher({
    name: "upsertApplication",
    description: "Add/insert application",
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload: Partial<Application>) => async (
        dispatch,
        getState
    ) => {
        const role = activeRoleSelector(getState());
        const activeSession = activeSessionSelector(getState());
        if (activeSession == null) {
            throw new Error(
                "Cannot upsert Applications without an active session"
            );
        }
        const { id: activeSessionId } = activeSession;
        const data = (await apiPOST(
            `/${role}/sessions/${activeSessionId}/applications`,
            prepApplicationForApi(payload)
        )) as RawApplication;
        dispatch(upsertOneApplicationSuccess(data));
        return data;
    },
});

export const deleteApplication = validatedApiDispatcher({
    name: "deleteApplication",
    description: "Delete application",
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const activeSession = activeSessionSelector(getState());
        if (activeSession == null) {
            throw new Error(
                "Cannot delete Applications without an active session"
            );
        }
        const { id: activeSessionId } = activeSession;
        const data = (await apiPOST(
            `/${role}/sessions/${activeSessionId}/applications/delete`,
            prepApplicationForApi(payload)
        )) as RawApplication;
        dispatch(deleteOneApplicationSuccess(data));
    },
});

export const exportApplications = validatedApiDispatcher({
    name: "exportApplications",
    description: "Export applications",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (
        formatter: PrepareDataFunc<Application>,
        format: ExportFormat = "spreadsheet"
    ) => async (dispatch, getState) => {
        if (!(formatter instanceof Function)) {
            throw new Error(
                `"formatter" must be a function when using the export action.`
            );
        }
        // Re-fetch all applicants from the server in case things happened to be out of sync.
        await Promise.all([
            dispatch(fetchApplicants()),
            dispatch(fetchPostings()),
            dispatch(fetchApplications()),
        ]);
        const applications = applicationsSelector(getState());

        return formatter(applications, format);
    },
});

// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
const localStoreSelector = applicationsReducer._localStoreSelector;
export const _applicationsSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData
);

// Get the current list of applications and recompute `applicant_id` and `position_id`
// to have corresponding `applicant` and `position` objects
export const applicationsSelector = createSelector(
    [
        _applicationsSelector,
        applicantsSelector,
        postingsSelector,
        positionsSelector,
    ],
    (applications, applicants, postings, positions) => {
        if (applications.length === 0) {
            return [];
        }

        const applicantsById = arrayToHash(applicants);
        const postingsById = arrayToHash(postings);
        const positionsById = arrayToHash(positions);

        // Change `applicant_id` to the corresponding `applicant` object
        // and similarly, change each `position_id` in each entry of
        // `position_preferences` to corresponding `position` object.
        return applications.map(
            ({ posting_id, applicant_id, position_preferences, ...rest }) =>
                (({
                    ...rest,
                    applicant: applicantsById[applicant_id] || {},
                    posting:
                        posting_id != null
                            ? postingsById[posting_id] || {}
                            : null,
                    position_preferences: position_preferences
                        .map(({ position_id, preference_level }) => ({
                            position: positionsById[position_id],
                            preference_level,
                        }))
                        .filter((x) => x.position != null),
                } as unknown) as Application)
        );
    }
);
