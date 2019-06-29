import { createReducer } from "redux-create-reducer";
import {
    FETCH_SESSIONS_SUCCESS,
    FETCH_ONE_SESSION_SUCCESS,
    UPSERT_ONE_SESSION_SUCCESS,
    DELETE_ONE_SESSION_SUCCESS,
    SET_ACTIVE_SESSION
} from "../constants";
import { createBasicReducerObject } from "./utils";

const initialState = {
    _modelData: [],
    activeSession: { id: null }
};

// XXX set some default data
// XXX remove whe the API is working
initialState._modelData = [
    {
        id: 1,
        start_date: "2019-09-08T00:00:00.000Z",
        end_date: "2019-12-31T00:00:00.000Z",
        name: "2019 Fall",
        rate1: 45.55,
        rate2: 47.33
    },
    {
        id: 2,
        start_date: "2020-01-01T00:00:00.000Z",
        end_date: "2020-04-30T00:00:00.000Z",
        name: "2020 Spring",
        rate1: 45.55,
        rate2: null
    }
];

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
