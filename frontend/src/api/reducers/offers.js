import {
    FETCH_OFFERS_SUCCESS
} from "../constants";
import { createBasicReducerObject, createReducer } from "./utils";

const initialState = {
    _modelData: []
};

// basicReducers is an object whose keys are FETCH_SESSIONS_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject(
    FETCH_OFFERS_SUCCESS
);

export const offersReducer = createReducer(initialState, basicReducers);
