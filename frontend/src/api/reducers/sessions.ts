import { Session } from "inspector";
import {
    FETCH_SESSIONS_SUCCESS,
    FETCH_ONE_SESSION_SUCCESS,
    UPSERT_ONE_SESSION_SUCCESS,
    DELETE_ONE_SESSION_SUCCESS,
    SET_ACTIVE_SESSION,
} from "../constants";
import { createBasicReducerObject, createReducer } from "./utils";
import type { BasicState, HasPayload } from "./utils";
import { RawSession } from "../defs/types";

export type SessionState = BasicState<RawSession> & {
    activeSession: RawSession | null;
};
const initialState: SessionState = {
    _modelData: [] as RawSession[],
    activeSession: null,
};

// basicReducers is an object whose keys are FETCH_SESSIONS_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject(
    FETCH_SESSIONS_SUCCESS,
    FETCH_ONE_SESSION_SUCCESS,
    UPSERT_ONE_SESSION_SUCCESS,
    DELETE_ONE_SESSION_SUCCESS
);

export const sessionsReducer = createReducer<SessionState>(initialState, {
    ...basicReducers,
    [SET_ACTIVE_SESSION]: (
        state: SessionState,
        action: HasPayload<RawSession>
    ): SessionState => ({
        ...state,
        activeSession: action.payload,
    }),
});
