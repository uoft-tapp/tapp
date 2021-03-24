import {
    FETCH_DDAHS_SUCCESS,
    FETCH_ONE_DDAH_SUCCESS,
    UPSERT_ONE_DDAH_SUCCESS,
    DELETE_ONE_DDAH_SUCCESS,
} from "../constants";
import { RawDdah } from "../defs/types";
import { createBasicReducerObject, createReducer } from "./utils";

interface DdahState {
    _modelData: RawDdah[];
}

const initialState: DdahState = {
    _modelData: [],
};

// basicReducers is an object whose keys are FETCH_SESSIONS_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject<RawDdah>(
    FETCH_DDAHS_SUCCESS,
    FETCH_ONE_DDAH_SUCCESS,
    UPSERT_ONE_DDAH_SUCCESS,
    DELETE_ONE_DDAH_SUCCESS
);

export const ddahsReducer = createReducer(initialState, basicReducers);
