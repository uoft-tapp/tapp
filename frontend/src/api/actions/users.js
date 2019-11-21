import {
    FETCH_ACTIVE_USER_SUCCESS,
    FETCH_USERS_SUCCESS,
    UPSERT_USERS_SUCCESS,
    SET_ACTIVE_USER_ROLE_SUCCESS
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import { actionFactory, validatedApiDispatcher } from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";
import { usersReducer } from "../reducers/users";

// actions
const fetchActiveUserSuccess = actionFactory(FETCH_ACTIVE_USER_SUCCESS);
const fetchUsersSuccess = actionFactory(FETCH_USERS_SUCCESS);
const upsertUserSuccess = actionFactory(UPSERT_USERS_SUCCESS);
const setActiveUserRoleSuccess = actionFactory(SET_ACTIVE_USER_ROLE_SUCCESS);

// dispatchers
export const fetchActiveUser = validatedApiDispatcher({
    name: "fetchActiveUser",
    description: "Fetch the active user",
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(`/${role}/active_user`);
        dispatch(fetchActiveUserSuccess(data));
    }
});

export const upsertUser = validatedApiDispatcher({
    name: "upsertUsers",
    description: "Upserts a user (setting their role(s))",
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: user => async dispatch => {
        const data = await apiPOST(`/admin/users`, user);
        dispatch(upsertUserSuccess(data));
        // After we update a wage chunk, we should refetch the assignment to make sure
        // there isn't stale data
        await dispatch(fetchUsers(user));
    }
});

export const fetchUsers = validatedApiDispatcher({
    name: "fetchUsers",
    description: "Fetch all users",
    propTypes: {},
    onErrorDispatch: e => upsertError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(`/${role}/users`);
        dispatch(fetchUsersSuccess(data));
    }
});

export const setActiveUserRole = validatedApiDispatcher({
    name: "setActiveUserRole",
    description: "Sets the role of the active user",
    onErrorDispatch: e => deleteError(e.toString()),
    dispatcher: payload => async dispatch => {
        dispatch(setActiveUserRoleSuccess(payload));
    }
});

// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.

// wage chunk data is stored with the assignments in the redux store
export const localStoreSelector = usersReducer._localStoreSelector;
export const usersSelector = localStoreSelector;
export const activeRoleSelector = state => usersSelector(state).active_role;
