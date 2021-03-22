import {
    FETCH_USERS_SUCCESS,
    FETCH_ACTIVE_USER_SUCCESS,
    SET_ACTIVE_USER_ROLE_SUCCESS,
} from "../constants";
import type { ActiveUser, User, UserRole } from "../defs/types";
import { createReducer } from "./utils";

export interface UsersState {
    users: User[];
    active_user: ActiveUser | {};
    active_role: UserRole | null;
}

const initialState: UsersState = {
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
