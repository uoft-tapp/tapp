import PropTypes from "prop-types";
import {
    FETCH_INSTRUCTORS_SUCCESS,
    FETCH_ONE_INSTRUCTOR_SUCCESS,
    UPSERT_ONE_INSTRUCTOR_SUCCESS,
    DELETE_ONE_INSTRUCTOR_SUCCESS
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    runOnActiveSessionChange,
    validatedApiDispatcher
} from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";

// actions
const fetchInstructorsSuccess = actionFactory(FETCH_INSTRUCTORS_SUCCESS);
const fetchOneInstructorSuccess = actionFactory(FETCH_ONE_INSTRUCTOR_SUCCESS);
const upsertOneInstructorSuccess = actionFactory(UPSERT_ONE_INSTRUCTOR_SUCCESS);
const deleteOneInstructorSuccess = actionFactory(DELETE_ONE_INSTRUCTOR_SUCCESS);

// dispatchers
export const fetchInstructors = validatedApiDispatcher({
    name: "fetchInstructors",
    description: "Fetch instructors",
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(`/sessions/${activeSessionId}/instructors`);
        dispatch(fetchInstructorsSuccess(data));
    }
});

export const fetchInstructor = validatedApiDispatcher({
    name: "fetchInstructor",
    description: "Fetch instructor",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(
            `/sessions/${activeSessionId}/instructors/${payload.id}`
        );
        dispatch(fetchOneInstructorSuccess(data));
    }
});

export const upsertInstructor = validatedApiDispatcher({
    name: "upsertInstructor",
    description: "Add/insert instructor",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => upsertError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/sessions/${activeSessionId}/instructors`,
            payload
        );
        dispatch(upsertOneInstructorSuccess(data));
    }
});

export const deleteInstructor = validatedApiDispatcher({
    name: "deleteInstructor",
    description: "Delete instructor",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => deleteError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/sessions/${activeSessionId}/instructors/delete`,
            payload
        );
        dispatch(deleteOneInstructorSuccess(data));
    }
});

// selectors
export const instructorsSelector = state => state._modelData;

// Any time the active session changes, we want to refetch
// all data. Calling `runOnActiveSessionChange` ensures that
// when the active session changes all data is re-fetched
runOnActiveSessionChange(fetchInstructors);
