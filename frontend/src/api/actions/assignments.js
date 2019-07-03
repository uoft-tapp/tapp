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
    validatedApiDispatcher
} from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";

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
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => upsertError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/sessions/${activeSessionId}/assignments`,
            payload
        );
        dispatch(upsertOneAssignmentSuccess(data));
    }
});

export const deleteAssignment = validatedApiDispatcher({
    name: "deleteAssignment",
    description: "Delete assignment",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => deleteError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/sessions/${activeSessionId}/assignments/delete`,
            payload
        );
        dispatch(deleteOneAssignmentSuccess(data));
    }
});

// selectors
export const assignmentsSelector = state => state._modelData;

// Any time the active session changes, we want to refetch
// all data. Calling `runOnActiveSessionChange` ensures that
// when the active session changes all data is re-fetched
runOnActiveSessionChange(fetchAssignments);
