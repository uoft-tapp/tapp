import { createReducer } from "redux-create-reducer";
import {
    FETCH_INSTRUCTORS_SUCCESS,
    FETCH_ONE_INSTRUCTOR_SUCCESS,
    UPSERT_ONE_INSTRUCTOR_SUCCESS,
    DELETE_ONE_INSTRUCTOR_SUCCESS
} from "../constants";
import { createBasicReducerObject } from "./utils";

const initialState = {
    _modelData: []
};

// basicReducers is an object whose keys are FETCH_SESSIONS_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject(
    FETCH_INSTRUCTORS_SUCCESS,
    FETCH_ONE_INSTRUCTOR_SUCCESS,
    UPSERT_ONE_INSTRUCTOR_SUCCESS,
    DELETE_ONE_INSTRUCTOR_SUCCESS
);

export const instructorsReducer = createReducer(initialState, basicReducers);
