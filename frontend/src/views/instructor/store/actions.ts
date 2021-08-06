import { createSelector } from "reselect";
import { positionsSelector } from "../../../api/actions";
import { RootState } from "../../../rootReducer";
import {
    SET_INSTRUCTOR_ACTIVE_POSITION,
    SET_INSTRUCTOR_DDAHS_FOR_EMAIL,
} from "./constants";

// actions
export const setDdahForEmailIds = (data: number[]) => ({
    type: SET_INSTRUCTOR_DDAHS_FOR_EMAIL,
    payload: data,
});

export const setActivePositionId = (data: number | null) => ({
    type: SET_INSTRUCTOR_ACTIVE_POSITION,
    payload: data,
});

// selectors
export const instructorUISelector = (state: RootState) => state.ui.instructor;
export const activePositionSelector = createSelector(
    [instructorUISelector, positionsSelector],
    (instructorUI, positions) => {
        return (
            positions.find(
                (position) => position.id === instructorUI.activePositionId
            ) || null
        );
    }
);
export const ddahsForEmailSelector = createSelector(
    [instructorUISelector],
    (instructorUI) => instructorUI.selectedDdahForEmailIds
);
