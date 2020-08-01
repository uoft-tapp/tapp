import {
    FETCH_USERS_SUCCESS,
    FETCH_ACTIVE_USER_SUCCESS,
    SET_ACTIVE_USER_ROLE_SUCCESS,
} from "../constants";
import { createReducer } from "./utils";

const initialState = {
    users: [],
    active_user: {},
    active_role: null,
};

export const usersReducer = createReducer(initialState, {
    [FETCH_ACTIVE_USER_SUCCESS]: (state, action) => ({
        ...state,
        active_user: action.payload,
    }),
    [FETCH_USERS_SUCCESS]: (state, action) => ({
        ...state,
        users: action.payload,
    }),
    [SET_ACTIVE_USER_ROLE_SUCCESS]: (state, action) => ({
        ...state,
        active_role: action.payload,
    }),
});
