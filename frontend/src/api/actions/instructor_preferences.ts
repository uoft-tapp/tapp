import {
    FETCH_INSTRUCTOR_PREFERENCES_SUCCESS,
    FETCH_ONE_INSTRUCTOR_PREFERENCE_SUCCESS,
    UPSERT_ONE_INSTRUCTOR_PREFERENCE_SUCCESS,
    DELETE_ONE_INSTRUCTOR_PREFERENCE_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    arrayToHash,
    validatedApiDispatcher,
    flattenIdFactory,
    HasId,
} from "./utils";
import { apiGET, apiPOST } from "../../libs/api-utils";
import { createSelector } from "reselect";
import { activeRoleSelector } from "./users";
import type {
    InstructorPreference,
    RawInstructorPreference,
} from "../defs/types";
import { activeSessionSelector } from "./sessions";
import { positionsSelector } from "./positions";
import { instructorPreferencesReducer } from "../reducers/instructorPreferences";
import { applicationsSelector } from "./applications";

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

// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
const localStoreSelector = instructorPreferencesReducer._localStoreSelector;
export const _instructorPreferencesSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData
);

// Get the current list of instructor_preferences and recompute `applicant_id` and `position_id`
// to have corresponding `applicant` and `position` objects
export const instructorPreferencesSelector = createSelector(
    [_instructorPreferencesSelector, applicationsSelector, positionsSelector],
    (instructor_preferences, applications, positions) => {
        if (instructor_preferences.length === 0) {
            return [];
        }

        const applicationsById = arrayToHash(applications);
        const positionsById = arrayToHash(positions);

        // Change `applicant_id` to the corresponding `applicant` object
        // and similarly, change each `position_id` in each entry of
        // `position_preferences` to corresponding `position` object.
        return instructor_preferences
            .map(
                ({ application_id, position_id, ...rest }) =>
                    ({
                        ...rest,
                        application: applicationsById[application_id],
                        position: positionsById[position_id],
                    } as InstructorPreference)
            )
            .filter(
                (pref) => pref.application != null && pref.position != null
            );
    }
);
