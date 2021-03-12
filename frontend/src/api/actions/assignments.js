import PropTypes from "prop-types";
import {
    FETCH_ASSIGNMENTS_SUCCESS,
    FETCH_ONE_ASSIGNMENT_SUCCESS,
    UPSERT_ONE_ASSIGNMENT_SUCCESS,
    DELETE_ONE_ASSIGNMENT_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    validatedApiDispatcher,
    arrayToHash,
    flattenIdFactory,
} from "./utils";
import { apiGET, apiPOST } from "../../libs/apis";
import { assignmentsReducer } from "../reducers/assignments";
import { createSelector } from "reselect";
import { applicantsSelector } from "./applicants";
import { positionsSelector } from "./positions";
import { activeRoleSelector } from "./users";
import {
    fetchWageChunksForAssignment,
    wageChunksByAssignmentSelector,
    upsertWageChunksForAssignment,
} from "./wage_chunks";

// actions
export const fetchAssignmentsSuccess = actionFactory(FETCH_ASSIGNMENTS_SUCCESS);
const fetchOneAssignmentSuccess = actionFactory(FETCH_ONE_ASSIGNMENT_SUCCESS);
const upsertOneAssignmentSuccess = actionFactory(UPSERT_ONE_ASSIGNMENT_SUCCESS);
const deleteOneAssignmentSuccess = actionFactory(DELETE_ONE_ASSIGNMENT_SUCCESS);

// dispatchers
export const fetchAssignments = validatedApiDispatcher({
    name: "fetchAssignments",
    description: "Fetch assignments",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(
            `/${role}/sessions/${activeSessionId}/assignments`
        );
        dispatch(fetchAssignmentsSuccess(data));
        return data;
    },
});

export const fetchAssignment = validatedApiDispatcher({
    name: "fetchAssignment",
    description: "Fetch assignment",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(`/${role}/assignments/${payload.id}`);
        dispatch(fetchOneAssignmentSuccess(data));
        return data;
    },
});

// Some helper functions to convert the data that the UI uses
// into data that the API can use
const applicantToApplicantId = flattenIdFactory("applicant", "applicant_id");
const positionToPositionId = flattenIdFactory("position", "position_id");
function prepForApi(data) {
    return positionToPositionId(applicantToApplicantId(data));
}

export const upsertAssignment = validatedApiDispatcher({
    name: "upsertAssignment",
    description: "Add/insert assignment",
    propTypes: {},
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        let data = await apiPOST(`/${role}/assignments`, prepForApi(payload));
        dispatch(upsertOneAssignmentSuccess(data));
        if (payload.wage_chunks) {
            await dispatch(
                upsertWageChunksForAssignment(data, payload.wage_chunks)
            );
            // The wage chunks could have changed the number of "hours" for the assignment.
            // Refetch it to make sure the data isn't stale.
            data = await dispatch(fetchAssignment(data));
        }
        dispatch(upsertOneAssignmentSuccess(data));
        return data;
    },
});

export const deleteAssignment = validatedApiDispatcher({
    name: "deleteAssignment",
    description: "Delete assignment",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiPOST(
            `/${role}/assignments/delete`,
            prepForApi(payload)
        );
        dispatch(deleteOneAssignmentSuccess(data));
    },
});

export const exportAssignments = validatedApiDispatcher({
    name: "exportAssignments",
    description: "Export assignments",
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
        await dispatch(fetchAssignments());
        const assignments = assignmentsSelector(getState());

        // Normally, wage chunk information is not fetched with an assignment. This information
        // must be fetched separately.
        const wageChunkPromises = assignments.map((assignment) =>
            dispatch(fetchWageChunksForAssignment(assignment))
        );
        await Promise.all(wageChunkPromises);
        // Attach the wage chunk information to each assignment
        for (const assignment of assignments) {
            assignment.wage_chunks = wageChunksByAssignmentSelector(getState())(
                assignment
            );
        }

        return formatter(assignments, format);
    },
});

export const upsertAssignments = validatedApiDispatcher({
    name: "upsertAssignments",
    description: "Upsert a list of assignments",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (assignments) => async (dispatch) => {
        if (assignments.length === 0) {
            return;
        }
        const dispatchers = assignments.map((assignment) =>
            dispatch(upsertAssignment(assignment))
        );
        await Promise.all(dispatchers);
        // Re-fetch all assignments from the server in case things happened to be out of sync.
        await dispatch(fetchAssignments());
    },
});

// selectors

/**
 * Returns whether the number of hours for the `assignment` and the sum
 * total hours of `wageChunks` match.
 *
 * @param {*} assignment
 * @param {*} wageChunks
 * @returns
 */
function wageChunksMatchAssignment(assignment, wageChunks) {
    if (!wageChunks) {
        return true;
    }
    let totalHours = 0;
    for (const chunk of wageChunks) {
        totalHours += chunk.hours;
    }
    return totalHours === assignment.hours;
}

// Each reducer is given an isolated state; instead of needing to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
export const localStoreSelector = assignmentsReducer._localStoreSelector;
/**
 * Get just the assignment data as it appears in the store; i.e., it has references to
 * id's of applicants and positions.
 */
const _assignmentsSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData
);
/**
 * Get the current assignments. This selector is memoized and will only
 * be recomputed when assignments, applicants, or positions change. If wageChunks
 * have been loaded for the assignment, they are included, otherwise they are null.
 */
export const assignmentsSelector = createSelector(
    [
        _assignmentsSelector,
        applicantsSelector,
        positionsSelector,
        wageChunksByAssignmentSelector,
    ],
    (assignments, applicants, positions, getWageChunksForAssignment) => {
        if (assignments.length === 0) {
            return [];
        }
        applicants = arrayToHash(applicants);
        positions = arrayToHash(positions);
        return assignments.map((assignment) => {
            const { position_id, applicant_id, ...rest } = assignment;
            const wage_chunks = getWageChunksForAssignment(assignment);
            return {
                ...rest,
                position: positions[position_id] || {},
                applicant: applicants[applicant_id] || {},
                // Only return wage chunks if they match the current assignment. This
                // ensures stale (previously-loaded) wage chunks don't get served.
                wage_chunks: wageChunksMatchAssignment(assignment, wage_chunks)
                    ? wage_chunks
                    : null,
            };
        });
    }
);
