import {
    FETCH_SESSIONS_SUCCESS,
    FETCH_ONE_SESSION_SUCCESS,
    UPSERT_ONE_SESSION_SUCCESS,
    DELETE_ONE_SESSION_SUCCESS,
    SET_ACTIVE_SESSION
} from "../constants";
import { createBasicReducerObject, createReducer } from "./utils";

const initialState = {
    _modelData: [],
    activeSession: { id: null }
};

// basicReducers is an object whose keys are FETCH_SESSIONS_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject(
    FETCH_SESSIONS_SUCCESS,
    FETCH_ONE_SESSION_SUCCESS,
    UPSERT_ONE_SESSION_SUCCESS,
    DELETE_ONE_SESSION_SUCCESS
);

export const sessionsReducer = createReducer(initialState, {
    ...basicReducers,
    [SET_ACTIVE_SESSION]: (state, action) => ({
        ...state,
        activeSession: action.payload
    })
});
