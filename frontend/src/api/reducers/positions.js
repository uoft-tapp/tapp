import { createReducer } from "redux-create-reducer";
import {
    FETCH_POSITIONS_SUCCESS,
    FETCH_ONE_POSITION_SUCCESS,
    UPSERT_ONE_POSITION_SUCCESS,
    DELETE_ONE_POSITION_SUCCESS
} from "../constants";
import { createBasicReducerObject } from "./utils";

const initialState = {
    _modelData: []
};

// basicReducers is an object whose keys are FETCH_SESSIONS_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject(
    FETCH_POSITIONS_SUCCESS,
    FETCH_ONE_POSITION_SUCCESS,
    UPSERT_ONE_POSITION_SUCCESS,
    DELETE_ONE_POSITION_SUCCESS
);

export const positionsReducer = createReducer(initialState, basicReducers);
