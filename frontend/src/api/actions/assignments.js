import PropTypes from "prop-types";
import {
    FETCH_ASSIGNMENTS_SUCCESS,
    FETCH_ONE_ASSIGNMENT_SUCCESS,
    UPSERT_ONE_ASSIGNMENT_SUCCESS,
    DELETE_ONE_ASSIGNMENT_SUCCESS
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    runOnActiveSessionChange,
    validatedApiDispatcher,
    arrayToHash
} from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";
import { assignmentsReducer } from "../reducers/assignments";
import { createSelector } from "reselect";
import { applicantsSelector } from "./applicants";
import { positionsSelector } from "./positions";

// actions
const fetchAssignmentsSuccess = actionFactory(FETCH_ASSIGNMENTS_SUCCESS);
const fetchOneAssignmentSuccess = actionFactory(FETCH_ONE_ASSIGNMENT_SUCCESS);
const upsertOneAssignmentSuccess = actionFactory(UPSERT_ONE_ASSIGNMENT_SUCCESS);
const deleteOneAssignmentSuccess = actionFactory(DELETE_ONE_ASSIGNMENT_SUCCESS);

// dispatchers
export const fetchAssignments = validatedApiDispatcher({
    name: "fetchAssignments",
    description: "Fetch assignments",
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(`/sessions/${activeSessionId}/assignments`);
        dispatch(fetchAssignmentsSuccess(data));
    }
});

export const fetchAssignment = validatedApiDispatcher({
    name: "fetchAssignment",
    description: "Fetch assignment",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(
            `/sessions/${activeSessionId}/assignments/${payload.id}`
        );
        dispatch(fetchOneAssignmentSuccess(data));
    }
});

export const upsertAssignment = validatedApiDispatcher({
    name: "upsertAssignment",
    description: "Add/insert assignment",
    propTypes: {},
    onErrorDispatch: e => upsertError(e.toString()),
    dispatcher: payload => async dispatch => {
        const data = await apiPOST(`/assignments`, payload);
        dispatch(upsertOneAssignmentSuccess(data));
    }
});

export const deleteAssignment = validatedApiDispatcher({
    name: "deleteAssignment",
    description: "Delete assignment",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => deleteError(e.toString()),
    dispatcher: payload => async dispatch => {
        const data = await apiPOST(`/assignments/delete`, payload);
        dispatch(deleteOneAssignmentSuccess(data));
    }
});

// selectors

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
    state => state._modelData
);
/**
 * Get the current assignments. This selector is memoized and will only
 * be recomputed when assignments, applicants, or positions change.
 */
export const assignmentsSelector = createSelector(
    [_assignmentsSelector, applicantsSelector, positionsSelector],
    (assignments, applicants, positions) => {
        if (assignments.length === 0) {
            return [];
        }
        applicants = arrayToHash(applicants);
        positions = arrayToHash(positions);
        return assignments.map(({ position_id, applicant_id, ...rest }) => ({
            ...rest,
            position: positions[position_id] || {},
            applicant: applicants[applicant_id] || {}
        }));
    }
);

// Any time the active session changes, we want to refetch
// all data. Calling `runOnActiveSessionChange` ensures that
// when the active session changes all data is re-fetched
runOnActiveSessionChange(fetchAssignments);
