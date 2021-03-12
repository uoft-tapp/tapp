import {
    FETCH_ACTIVE_USER_SUCCESS,
    FETCH_USERS_SUCCESS,
    UPSERT_USERS_SUCCESS,
    SET_ACTIVE_USER_ROLE_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import { actionFactory, validatedApiDispatcher } from "./utils";
import { apiGET, apiPOST } from "../../libs/apis";
import { usersReducer } from "../reducers/users";
import { initFromStage } from "./init";

// actions
const fetchActiveUserSuccess = actionFactory(FETCH_ACTIVE_USER_SUCCESS);
const fetchUsersSuccess = actionFactory(FETCH_USERS_SUCCESS);
const upsertUserSuccess = actionFactory(UPSERT_USERS_SUCCESS);
const setActiveUserRoleSuccess = actionFactory(SET_ACTIVE_USER_ROLE_SUCCESS);

// dispatchers
export const fetchActiveUser = validatedApiDispatcher({
    name: "fetchActiveUser",
    description: "Fetch the active user",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const data = await apiGET(`/active_user`);
        dispatch(fetchActiveUserSuccess(data));
        // If our currently-set role is one that we don't have,
        // set our role to one we do have.
        const currentRole = activeRoleSelector(getState());
        if (data.roles && !data.roles.includes(currentRole)) {
            dispatch(setActiveUserRole(data.roles[0]));
        }
        return data;
    },
});

export const upsertUser = validatedApiDispatcher({
    name: "upsertUsers",
    description: "Upserts a user (setting their role(s))",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (user) => async (dispatch) => {
        const data = await apiPOST(`/admin/users`, user);
        dispatch(upsertUserSuccess(data));
        await dispatch(fetchUsers(user));
    },
});

export const fetchUsers = validatedApiDispatcher({
    name: "fetchUsers",
    description: "Fetch all users",
    propTypes: {},
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(`/${role}/users`);
        dispatch(fetchUsersSuccess(data));
        return data;
    },
});

export const setActiveUserRole = validatedApiDispatcher({
    name: "setActiveUserRole",
    description: "Sets the role of the active user",
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload, options = {}) => async (dispatch) => {
        await dispatch(setActiveUserRoleSuccess(payload));
        if (!options.skipInit) {
            await dispatch(
                initFromStage("setActiveUserRole", { startAfterStage: true })
            );
        }
    },
});

export const debugOnlyFetchUsers = validatedApiDispatcher({
    name: "debugOnlyFetchUsers",
    description:
        "Fetch all users; this is available only in debug mode and bypasses any user permissions",
    propTypes: {},
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: () => async (dispatch) => {
        const data = await apiGET(`/debug/users`);
        dispatch(fetchUsersSuccess(data));
    },
});

export const debugOnlySetActiveUser = validatedApiDispatcher({
    name: "debugOnlySetActiveUser",
    description:
        "Sets the active user (i.e. fakes the 'logged on' user); available only in debug mode",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (user, options = {}) => async (dispatch) => {
        const data = await apiPOST(`/debug/active_user`, user);
        await dispatch(fetchActiveUserSuccess(data));
        // The new user we switch to might not have the same roles as the previous user.
        // Default to the highest-authority role available, which is the first in the list.
        await dispatch(setActiveUserRoleSuccess(data.roles[0]));

        // After the active user has been set, we need to re-download (almost) all data
        // with the permissions of the new active user.
        if (!options.skipInit) {
            await dispatch(initFromStage("setActiveUser"));
        }
    },
});

// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
export const localStoreSelector = usersReducer._localStoreSelector;
export const usersSelector = (state) => localStoreSelector(state).users;
export const activeUserSelector = (state) =>
    localStoreSelector(state).active_user;
export const activeRoleSelector = (state) =>
    localStoreSelector(state).active_role;
