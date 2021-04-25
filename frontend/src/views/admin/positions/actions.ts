import { RootState } from "../../../rootReducer";
import { SET_SELECTED_POSITION_ROWS } from "./constants";

// actions
export const setSelectedPositionRows = (data: number[]) => ({
    type: SET_SELECTED_POSITION_ROWS,
    payload: data,
});

// selectors
export const offerTableSelector = (state: RootState) => state.ui.positionsTable;
