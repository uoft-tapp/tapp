import {
    FETCH_INSTRUCTOR_PREFERENCES_SUCCESS,
    FETCH_ONE_INSTRUCTOR_PREFERENCE_SUCCESS,
    UPSERT_ONE_INSTRUCTOR_PREFERENCE_SUCCESS,
    DELETE_ONE_INSTRUCTOR_PREFERENCE_SUCCESS,
} from "../constants";
import { RawInstructorPreference } from "../defs/types";
import { createReducer, HasPayload } from "./utils";

interface InstructorPreferenceState {
    _modelData: RawInstructorPreference[];
}
const initialState: InstructorPreferenceState = {
    _modelData: [],
};

export function upsertItem(
    modelData: RawInstructorPreference[],
    newItem: RawInstructorPreference
): RawInstructorPreference[] {
    let didUpdate = false;
    const newModelData = modelData.map((item) => {
        if (
            item.position_id === newItem.position_id &&
            item.application_id === newItem.application_id
        ) {
            didUpdate = true;
            return newItem;
        }
        return item;
    });
    if (!didUpdate) {
        newModelData.push(newItem);
    }
    return newModelData;
}

// PositionPostings have no `id` field, but they are uniquely determined
// by their `position_id` adn `posting_id`. So, we need to create custom
// reducer functions.
export const instructorPreferencesReducer = createReducer(initialState, {
    [FETCH_INSTRUCTOR_PREFERENCES_SUCCESS]: (
        state: InstructorPreferenceState,
        action: HasPayload<RawInstructorPreference[]>
    ) => ({
        ...state,
        _modelData: action.payload,
    }),
    [FETCH_ONE_INSTRUCTOR_PREFERENCE_SUCCESS]: (
        state: InstructorPreferenceState,
        action: HasPayload<RawInstructorPreference>
    ) => ({
        ...state,
        _modelData: upsertItem(state._modelData, action.payload),
    }),
    [UPSERT_ONE_INSTRUCTOR_PREFERENCE_SUCCESS]: (
        state: InstructorPreferenceState,
        action: HasPayload<RawInstructorPreference>
    ) => ({
        ...state,
        _modelData: upsertItem(state._modelData, action.payload),
    }),
    [DELETE_ONE_INSTRUCTOR_PREFERENCE_SUCCESS]: (
        state: InstructorPreferenceState,
        action: HasPayload<RawInstructorPreference>
    ) => {
        const deletedItem = action.payload;
        return {
            ...state,
            _modelData: state._modelData.filter(
                (item) =>
                    !(
                        item.position_id === deletedItem.position_id &&
                        item.application_id === deletedItem.application_id
                    )
            ),
        };
    },
});
