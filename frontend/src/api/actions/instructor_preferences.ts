import {
    FETCH_INSTRUCTOR_PREFERENCES_SUCCESS,
    FETCH_ONE_INSTRUCTOR_PREFERENCE_SUCCESS,
    UPSERT_ONE_INSTRUCTOR_PREFERENCE_SUCCESS,
    DELETE_ONE_INSTRUCTOR_PREFERENCE_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    validatedApiDispatcher,
    flattenIdFactory,
    HasId,
} from "./utils";
import { apiGET, apiPOST } from "../../libs/api-utils";
import { activeRoleSelector } from "./users";
import type {
    InstructorPreference,
    RawInstructorPreference,
} from "../defs/types";
import { activeSessionSelector } from "./sessions";

// actions
export const fetchInstructorPreferencesSuccess = actionFactory<
    RawInstructorPreference[]
>(FETCH_INSTRUCTOR_PREFERENCES_SUCCESS);
const fetchOneInstructorPreferenceSuccess =
    actionFactory<RawInstructorPreference>(
        FETCH_ONE_INSTRUCTOR_PREFERENCE_SUCCESS
    );
const upsertOneInstructorPreferenceSuccess =
    actionFactory<RawInstructorPreference>(
        UPSERT_ONE_INSTRUCTOR_PREFERENCE_SUCCESS
    );
const deleteOneInstructorPreferenceSuccess =
    actionFactory<RawInstructorPreference>(
        DELETE_ONE_INSTRUCTOR_PREFERENCE_SUCCESS
    );

const applicationToApplicationId = flattenIdFactory<
    "application",
    "application_id"
>("application", "application_id");

const positionToPositionId = flattenIdFactory<"position", "position_id">(
    "position",
    "position_id"
);

function prepInstructorPreferenceForApi(data: Partial<InstructorPreference>) {
    return positionToPositionId(applicationToApplicationId(data as any));
}

// dispatchers
export const fetchInstructorPreferences = validatedApiDispatcher({
    name: "fetchInstructorPreferences",
    description: "Fetch instructor_preferences",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const activeSession = activeSessionSelector(getState());
        if (activeSession == null) {
            throw new Error(
                "Cannot fetch InstructorPreferences without an active session"
            );
        }
        const { id: activeSessionId } = activeSession;
        const data = (await apiGET(
            `/${role}/sessions/${activeSessionId}/instructor_preferences`
        )) as RawInstructorPreference[];
        dispatch(fetchInstructorPreferencesSuccess(data));
        return data;
    },
});

export const fetchInstructorPreference = validatedApiDispatcher({
    name: "fetchInstructorPreference",
    description: "Fetch instructor_preference",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const activeSession = activeSessionSelector(getState());
        if (activeSession == null) {
            throw new Error(
                "Cannot fetch InstructorPreferences without an active session"
            );
        }
        const { id: activeSessionId } = activeSession;
        const data = (await apiGET(
            `/${role}/sessions/${activeSessionId}/instructor_preferences/${payload.id}`
        )) as RawInstructorPreference;
        dispatch(fetchOneInstructorPreferenceSuccess(data));
        return data;
    },
});

export const upsertInstructorPreference = validatedApiDispatcher({
    name: "upsertInstructorPreference",
    description: "Add/insert instructor_preference",
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher:
        (payload: Partial<InstructorPreference>) =>
        async (dispatch, getState) => {
            const role = activeRoleSelector(getState());
            const data = (await apiPOST(
                `/${role}/instructor_preferences`,
                prepInstructorPreferenceForApi(payload)
            )) as RawInstructorPreference;
            dispatch(upsertOneInstructorPreferenceSuccess(data));
            return data;
        },
});

export const deleteInstructorPreference = validatedApiDispatcher({
    name: "deleteInstructorPreference",
    description: "Delete instructor_preference",
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher:
        (payload: Pick<InstructorPreference, "application" | "position">) =>
        async (dispatch, getState) => {
            const role = activeRoleSelector(getState());
            const data = (await apiPOST(
                `/${role}/instructor_preferences/delete`,
                prepInstructorPreferenceForApi(payload)
            )) as RawInstructorPreference;
            dispatch(deleteOneInstructorPreferenceSuccess(data));
        },
});
