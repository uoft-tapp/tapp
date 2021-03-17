import {
    FETCH_POSTING_POSITIONS_SUCCESS,
    FETCH_ONE_POSTING_POSITION_SUCCESS,
    UPSERT_ONE_POSTING_POSITION_SUCCESS,
    DELETE_ONE_POSTING_POSITION_SUCCESS,
} from "../constants";
import { createBasicReducerObject, createReducer } from "./utils";

const initialState = {
    _modelData: [],
};

// basicReducers is an object whose keys are FETCH_SESSIONS_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject(
    FETCH_POSTING_POSITIONS_SUCCESS,
    FETCH_ONE_POSTING_POSITION_SUCCESS,
    UPSERT_ONE_POSTING_POSITION_SUCCESS,
    DELETE_ONE_POSTING_POSITION_SUCCESS
);

export const postingPositionsReducer = createReducer(initialState, basicReducers);
