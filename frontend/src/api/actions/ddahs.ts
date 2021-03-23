import {
    FETCH_DDAHS_SUCCESS,
    FETCH_ONE_DDAH_SUCCESS,
    UPSERT_ONE_DDAH_SUCCESS,
    DELETE_ONE_DDAH_SUCCESS,
    DDAH_APPROVE_SUCCESS,
    DDAH_EMAIL_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    validatedApiDispatcher,
    arrayToHash,
    flattenIdFactory,
    HasId,
    HasSubIdField,
    hasSubIdField,
} from "./utils";
import { apiGET, apiPOST } from "../../libs/api-utils";
import { createSelector } from "reselect";
import { activeRoleSelector } from "./users";
import { ddahsReducer } from "../reducers";
import { assignmentsSelector } from "./assignments";
import type { Ddah, RawAttachment, RawDdah } from "../defs/types";

// actions
const fetchDdahsSuccess = actionFactory<RawDdah[]>(FETCH_DDAHS_SUCCESS);
const fetchOneDdahSuccess = actionFactory<RawDdah>(FETCH_ONE_DDAH_SUCCESS);
const upsertOneDdahSuccess = actionFactory<RawDdah>(UPSERT_ONE_DDAH_SUCCESS);
const deleteOneDdahSuccess = actionFactory<RawDdah>(DELETE_ONE_DDAH_SUCCESS);
const approveOneDdahSuccess = actionFactory<RawDdah>(DDAH_APPROVE_SUCCESS);
const emailOneDdahSuccess = actionFactory<RawDdah>(DDAH_EMAIL_SUCCESS);

// dispatchers
export const fetchDdahs = validatedApiDispatcher({
    name: "fetchDdahs",
    description: "Fetch DDAHs",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const activeSession = getState().model.sessions.activeSession;
        if (activeSession == null) {
            throw new Error("Cannot fetch DDAHs without an active session");
        }
        const { id: activeSessionId } = activeSession;
        const data = (await apiGET(
            `/${role}/sessions/${activeSessionId}/ddahs`
        )) as RawDdah[];
        dispatch(fetchDdahsSuccess(data));
        return data;
    },
});

export const fetchDdah = validatedApiDispatcher({
    name: "fetchDdah",
    description: "Fetch a DDAH",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiGET(`/${role}/ddahs/${payload.id}`)) as RawDdah;
        dispatch(fetchOneDdahSuccess(data));
        return data;
    },
});

// Some helper functions to convert the data that the UI uses
// into data that the API can use
const assignmentToAssignmentId = flattenIdFactory<
    HasSubIdField<"assignment">,
    "assignment",
    "assignment_id"
>("assignment", "assignment_id");
function prepForApi(data: Partial<Ddah>) {
    if (hasSubIdField(data, "assignment")) {
        return assignmentToAssignmentId(data);
    }
    return data;
}

export const approveDdah = validatedApiDispatcher({
    name: "approveDdah",
    description: "Set a DDAH's status to approved",
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        let data = (await apiPOST(
            `/${role}/ddahs/${payload.id}/approve`
        )) as RawDdah;
        dispatch(approveOneDdahSuccess(data));
        // The previous action doesn't actually update the redux store,
        // so we dispatch a fake upsert action to make sure the store gets updated
        // with the new data.
        dispatch(upsertOneDdahSuccess(data));
        return data;
    },
});

export const emailDdah = validatedApiDispatcher({
    name: "emailDdah",
    description: "Email a DDAH",
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        let data = (await apiPOST(
            `/${role}/ddahs/${payload.id}/email`
        )) as RawDdah;
        dispatch(emailOneDdahSuccess(data));
        // The previous action doesn't actually update the redux store,
        // so we dispatch a fake upsert action to make sure the store gets updated
        // with the new data.
        dispatch(upsertOneDdahSuccess(data));
        return data;
    },
});

export const upsertDdah = validatedApiDispatcher({
    name: "upsertDdah",
    description: "Add/insert a DDAH",
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload: Partial<Ddah>) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        let data = (await apiPOST(
            `/${role}/ddahs`,
            prepForApi(payload)
        )) as RawDdah;
        dispatch(upsertOneDdahSuccess(data));
        return data;
    },
});

export const deleteDdah = validatedApiDispatcher({
    name: "deleteDdah",
    description: "Delete a DDAH",
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiPOST(
            `/${role}/assignments/delete`,
            prepForApi(payload)
        )) as RawDdah;
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
    dispatcher: (ddahs: Partial<Ddah>[]) => async (dispatch) => {
        if (ddahs.length === 0) {
            return;
        }
        const dispatchers = ddahs.map((ddah) => dispatch(upsertDdah(ddah)));
        await Promise.all(dispatchers);
        // Re-fetch all assignments from the server in case things happened to be out of sync.
        await dispatch(fetchDdahs());
    },
});

export const downloadDdahAcceptedList = validatedApiDispatcher({
    name: "downloadDdahAcceptedList",
    description: "Download a pdf list of accepted DDAHs for the active session",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const activeSession = getState().model.sessions.activeSession;
        if (activeSession == null) {
            throw new Error("Cannot fetch DDAHs without an active session");
        }
        const { id: activeSessionId } = activeSession;
        const data = (await apiGET(
            `/${role}/sessions/${activeSessionId}/ddahs/accepted_list.pdf`
        )) as RawAttachment;

        // The data comes in encoded as base64, so we decode it as binary data.
        const content = new Uint8Array(
            atob(data.content)
                .split("")
                .map((x) => x.charCodeAt(0))
        );
        return new File([content], data.file_name, {
            type: data.mime_type,
        });
    },
});

// selectors

/**
 * Compute the status of a DDAH (e.g., accepted/rejected)
 *
 * @param {*} ddah
 * @returns
 */
function computeDdahStatus(ddah: Pick<Ddah, "accepted_date" | "emailed_date">) {
    if (ddah.accepted_date) {
        return "accepted";
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
function computeDdahHours(ddah: Pick<Ddah, "duties">) {
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
    (state) => state._modelData as RawDdah[]
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
        })) as Ddah[];
    }
);
