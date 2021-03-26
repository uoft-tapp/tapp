import {
    FETCH_POSITIONS_SUCCESS,
    FETCH_ONE_POSITION_SUCCESS,
    UPSERT_ONE_POSITION_SUCCESS,
    DELETE_ONE_POSITION_SUCCESS,
} from "../constants";
import { RawPosition } from "../defs/types";
import { createBasicReducerObject, createReducer } from "./utils";

interface PositionState {
    _modelData: RawPosition[];
}
const initialState: PositionState = {
    _modelData: [],
};

// basicReducers is an object whose keys are FETCH_SESSIONS_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject<RawPosition>(
    FETCH_POSITIONS_SUCCESS,
    FETCH_ONE_POSITION_SUCCESS,
    UPSERT_ONE_POSITION_SUCCESS,
    DELETE_ONE_POSITION_SUCCESS
);

export const positionsReducer = createReducer(initialState, basicReducers);
