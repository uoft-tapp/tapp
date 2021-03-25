import {
    FETCH_APPLICATIONS_SUCCESS,
    FETCH_ONE_APPLICATION_SUCCESS,
    UPSERT_ONE_APPLICATION_SUCCESS,
    DELETE_ONE_APPLICATION_SUCCESS,
} from "../constants";
import { RawApplication } from "../defs/types";
import { createBasicReducerObject, createReducer } from "./utils";

interface ApplicationState {
    _modelData: RawApplication[];
}
const initialState: ApplicationState = {
    _modelData: [],
};

// basicReducers is an object whose keys are FETCH_SESSIONS_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject<RawApplication>(
    FETCH_APPLICATIONS_SUCCESS,
    FETCH_ONE_APPLICATION_SUCCESS,
    UPSERT_ONE_APPLICATION_SUCCESS,
    DELETE_ONE_APPLICATION_SUCCESS
);

export const applicationsReducer = createReducer(initialState, basicReducers);
