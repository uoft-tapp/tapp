import {
    FETCH_INSTRUCTORS_SUCCESS,
    FETCH_ONE_INSTRUCTOR_SUCCESS,
    UPSERT_ONE_INSTRUCTOR_SUCCESS,
    DELETE_ONE_INSTRUCTOR_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import { actionFactory, HasId, validatedApiDispatcher } from "./utils";
import { apiGET, apiPOST } from "../../libs/api-utils";
import { instructorsReducer } from "../reducers/instructors";
import { createSelector } from "reselect";
import { activeRoleSelector } from "./users";
import { Instructor, RawInstructor } from "../defs/types";
import { ExportFormat, PrepareDataFunc } from "../../libs/import-export";

// actions
export const fetchInstructorsSuccess = actionFactory<RawInstructor[]>(
    FETCH_INSTRUCTORS_SUCCESS
);
const fetchOneInstructorSuccess = actionFactory<RawInstructor>(
    FETCH_ONE_INSTRUCTOR_SUCCESS
);
const upsertOneInstructorSuccess = actionFactory<RawInstructor>(
    UPSERT_ONE_INSTRUCTOR_SUCCESS
);
const deleteOneInstructorSuccess = actionFactory<RawInstructor>(
    DELETE_ONE_INSTRUCTOR_SUCCESS
);

// dispatchers
export const fetchInstructors = validatedApiDispatcher({
    name: "fetchInstructors",
    description: "Fetch instructors",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiGET(`/${role}/instructors`)) as RawInstructor[];
        dispatch(fetchInstructorsSuccess(data));
        return data;
    },
});

export const fetchInstructor = validatedApiDispatcher({
    name: "fetchInstructor",
    description: "Fetch instructor",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/instructors/${payload.id}`
        )) as RawInstructor;
        dispatch(fetchOneInstructorSuccess(data));
        return data;
    },
});

export const upsertInstructor = validatedApiDispatcher({
    name: "upsertInstructor",
    description: "Add/insert instructor",
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload: Partial<Instructor>) => async (
        dispatch,
        getState
    ) => {
        const role = activeRoleSelector(getState());
        const data = (await apiPOST(
            `/${role}/instructors`,
            payload
        )) as RawInstructor;
        dispatch(upsertOneInstructorSuccess(data));
        return data;
    },
});

export const deleteInstructor = validatedApiDispatcher({
    name: "deleteInstructor",
    description: "Delete instructor",
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiPOST(
            `/${role}/instructors/delete`,
            payload
        )) as RawInstructor;
        dispatch(deleteOneInstructorSuccess(data));
    },
});

export const exportInstructors = validatedApiDispatcher({
    name: "exportInstructors",
    description: "Export instructors",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (
        formatter: PrepareDataFunc<Instructor>,
        format: ExportFormat = "spreadsheet"
    ) => async (dispatch, getState) => {
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
    description: "Upsert instructors",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (instructors: Partial<Instructor>[]) => async (dispatch) => {
        if (instructors.length === 0) {
            return;
        }
        const dispatchers = instructors.map((instructor) =>
            dispatch(upsertInstructor(instructor))
        );
        await Promise.all(dispatchers);
        // Re-fetch all instructors from the server in case things happened to be out of sync.
        return await dispatch(fetchInstructors());
    },
});
// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
const localStoreSelector = instructorsReducer._localStoreSelector;
export const instructorsSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData as Instructor[]
);
