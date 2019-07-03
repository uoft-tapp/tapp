import { createReducer } from "redux-create-reducer";
import {
    FETCH_ASSIGNMENTS_SUCCESS,
    FETCH_ONE_ASSIGNMENT_SUCCESS,
    UPSERT_ONE_ASSIGNMENT_SUCCESS,
    DELETE_ONE_ASSIGNMENT_SUCCESS
} from "../constants";
import { createBasicReducerObject } from "./utils";

const initialState = {
    _modelData: []
};

// basicReducers is an object whose keys are FETCH_SESSIONS_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject(
    FETCH_ASSIGNMENTS_SUCCESS,
    FETCH_ONE_ASSIGNMENT_SUCCESS,
    UPSERT_ONE_ASSIGNMENT_SUCCESS,
    DELETE_ONE_ASSIGNMENT_SUCCESS
);

export const assignmentsReducer = createReducer(initialState, basicReducers);
