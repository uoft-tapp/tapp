import PropTypes from "prop-types";
import {
    FETCH_INSTRUCTORS_SUCCESS,
    FETCH_ONE_INSTRUCTOR_SUCCESS,
    UPSERT_ONE_INSTRUCTOR_SUCCESS,
    DELETE_ONE_INSTRUCTOR_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import { actionFactory, validatedApiDispatcher } from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";
import { instructorsReducer } from "../reducers/instructors";
import { createSelector } from "reselect";
import { activeRoleSelector } from "./users";

// actions
const fetchInstructorsSuccess = actionFactory(FETCH_INSTRUCTORS_SUCCESS);
const fetchOneInstructorSuccess = actionFactory(FETCH_ONE_INSTRUCTOR_SUCCESS);
const upsertOneInstructorSuccess = actionFactory(UPSERT_ONE_INSTRUCTOR_SUCCESS);
const deleteOneInstructorSuccess = actionFactory(DELETE_ONE_INSTRUCTOR_SUCCESS);

// dispatchers
export const fetchInstructors = validatedApiDispatcher({
    name: "fetchInstructors",
    description: "Fetch instructors",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(`/${role}/instructors`);
        dispatch(fetchInstructorsSuccess(data));
    },
});

export const fetchInstructor = validatedApiDispatcher({
    name: "fetchInstructor",
    description: "Fetch instructor",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(`/${role}/instructors/${payload.id}`);
        dispatch(fetchOneInstructorSuccess(data));
    },
});

export const upsertInstructor = validatedApiDispatcher({
    name: "upsertInstructor",
    description: "Add/insert instructor",
    propTypes: {},
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiPOST(`/${role}/instructors`, payload);
        dispatch(upsertOneInstructorSuccess(data));
    },
});

export const deleteInstructor = validatedApiDispatcher({
    name: "deleteInstructor",
    description: "Delete instructor",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiPOST(`/${role}/instructors/delete`, payload);
        dispatch(deleteOneInstructorSuccess(data));
    },
});

export const exportInstructors = validatedApiDispatcher({
    name: "exportInstructors",
    description: "Export instructors",
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
        // Re-fetch all instructors from the server in case things happened to be out of sync.
        await dispatch(fetchInstructors());
        const instructors = instructorsSelector(getState());

        return formatter(instructors, format);
    },
});

export const upsertInstructors = validatedApiDispatcher({
    name: "upsertInstructors",
    description: "Export instructors",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (instructors) => async (dispatch) => {
        if (instructors.length === 0) {
            return;
        }
        const dispatchers = instructors.map((instructor) =>
            dispatch(upsertInstructor(instructor))
        );
        await Promise.all(dispatchers);
        // Re-fetch all instructors from the server in case things happened to be out of sync.
        await dispatch(fetchInstructors());
    },
});
// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
export const localStoreSelector = instructorsReducer._localStoreSelector;
export const instructorsSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData
);
