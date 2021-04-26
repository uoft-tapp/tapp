import { createSelector } from "reselect";
import { positionsSelector } from "../../../api/actions";
import { RootState } from "../../../rootReducer";
import { SET_SELECTED_POSITION } from "./constants";

// actions
export const setSelectedPosition = (data: number | null) => ({
    type: SET_SELECTED_POSITION,
    payload: data,
});

// selectors
export const positionsTableSelector = (state: RootState) =>
    state.ui.positionsTable;
export const selectedPositionSelector = createSelector(
    [positionsTableSelector, positionsSelector],
    (positionsTableState, positions) => {
        const selectedId = positionsTableState.selectedPositionIds;
        if (selectedId == null) {
            return null;
        }
        return positions.find((position) => position.id === selectedId);
    }
);
