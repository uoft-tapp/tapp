import PropTypes from "prop-types";
import {
    FETCH_DDAHS_SUCCESS,
    FETCH_ONE_DDAH_SUCCESS,
    UPSERT_ONE_DDAH_SUCCESS,
    DELETE_ONE_DDAH_SUCCESS,
    DDAH_APPROVE_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    validatedApiDispatcher,
    arrayToHash,
    flattenIdFactory,
} from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";
import { createSelector } from "reselect";
import { activeRoleSelector } from "./users";
import { ddahsReducer } from "../reducers";
import { assignmentsSelector } from "./assignments";

// actions
const fetchDdahsSuccess = actionFactory(FETCH_DDAHS_SUCCESS);
const fetchOneDdahSuccess = actionFactory(FETCH_ONE_DDAH_SUCCESS);
const upsertOneDdahSuccess = actionFactory(UPSERT_ONE_DDAH_SUCCESS);
const deleteOneDdahSuccess = actionFactory(DELETE_ONE_DDAH_SUCCESS);
const approveOneDdahSuccess = actionFactory(DDAH_APPROVE_SUCCESS);

// dispatchers
export const fetchDdahs = validatedApiDispatcher({
    name: "fetchDdahs",
    description: "Fetch DDAHs",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(`/${role}/sessions/${activeSessionId}/ddahs`);
        dispatch(fetchDdahsSuccess(data));
        return data;
    },
});

export const fetchDdah = validatedApiDispatcher({
    name: "fetchDdah",
    description: "Fetch a DDAH",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(`/${role}/ddahs/${payload.id}`);
        dispatch(fetchOneDdahSuccess(data));
        return data;
    },
});

// Some helper functions to convert the data that the UI uses
// into data that the API can use
const assignmentToAssignmentId = flattenIdFactory(
    "assignment",
    "assignment_id"
);
function prepForApi(data) {
    const ret = assignmentToAssignmentId(data);
    delete ret.applicant;
    return ret;
}

export const approveDdah = validatedApiDispatcher({
    name: "approveDdah",
    description: "Set a DDAH's status to approved",
    propTypes: {},
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        let data = await apiPOST(`/${role}/ddahs/${payload.id}/approve`);
        dispatch(approveOneDdahSuccess(data));
        return data;
    },
});

export const upsertDdah = validatedApiDispatcher({
    name: "upsertDdah",
    description: "Add/insert a DDAH",
    propTypes: {},
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        let data = await apiPOST(`/${role}/ddahs`, prepForApi(payload));
        dispatch(upsertOneDdahSuccess(data));
        return data;
    },
});

export const deleteDdah = validatedApiDispatcher({
    name: "deleteDdah",
    description: "Delete a DDAH",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiPOST(
            `/${role}/assignments/delete`,
            prepForApi(payload)
        );
        dispatch(deleteOneDdahSuccess(data));
    },
});

export const exportDdahs = validatedApiDispatcher({
    name: "exportDdahs",
    description: "Export DDAHs",
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
        // Re-fetch all assignments from the server in case things happened to be out of sync.
        await dispatch(fetchDdahs());
        const ddahs = ddahsSelector(getState());

        return formatter(ddahs, format);
    },
});

export const upsertDdahs = validatedApiDispatcher({
    name: "upsertDdahs",
    description: "Upsert a list of DDAHs",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (ddahs) => async (dispatch) => {
        if (ddahs.length === 0) {
            return;
        }
        const dispatchers = ddahs.map((ddah) => dispatch(upsertDdah(ddah)));
        await Promise.all(dispatchers);
        // Re-fetch all assignments from the server in case things happened to be out of sync.
        await dispatch(fetchDdahs());
    },
});

// selectors

/**
 * Compute the status of a DDAH (e.g., accepted/rejected)
 *
 * @param {*} ddah
 * @returns
 */
function computeDdahStatus(ddah) {
    if (ddah.accepted_date && ddah.approved_date) {
        return "accepted_and_approved";
    }
    if (ddah.accepted_date) {
        return "accepted";
    }
    if (ddah.rejected_date) {
        return "rejected";
    }
    if (ddah.emailed_date) {
        return "emailed";
    }
    return null;
}

/**
 * Compute the total number of hours for all duties for the current DDAH
 *
 * @param {*} ddah
 * @returns
 */
function computeDdahHours(ddah) {
    let ret = 0;
    for (const duty of ddah.duties) {
        ret += duty.hours;
    }
    return ret;
}

// Each reducer is given an isolated state; instead of needing to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
export const localStoreSelector = ddahsReducer._localStoreSelector;
/**
 * Get just the ddah data as it appears in the store; i.e., it has references to
 * id's of assignments.
 */
const _ddahsSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData
);
/**
 * Get the current ddahs. This selector is memoized and will only
 * be recomputed when ddahs or assignments change.
 */
export const ddahsSelector = createSelector(
    [_ddahsSelector, assignmentsSelector],
    (ddahs, assignments) => {
        if (ddahs.length === 0) {
            return [];
        }
        assignments = arrayToHash(assignments);
        return ddahs.map(({ assignment_id, ...rest }) => ({
            ...rest,
            status: computeDdahStatus(rest),
            total_hours: computeDdahHours(rest),
            assignment: assignments[assignment_id] || {},
        }));
    }
);
