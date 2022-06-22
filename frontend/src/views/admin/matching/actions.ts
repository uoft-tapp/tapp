import { RootState } from "../../../rootReducer";
import { SET_SELECTED_ROWS } from "./constants";

// actions
export const setSelectedRows = (data: number[]) => ({
    type: SET_SELECTED_ROWS,
    payload: data,
});

// selectors
export const matchingDataSelector = (state: RootState) => state.ui.matchingData;
export const matchesSelector = (state: RootState) => state.ui.matchingData.matches;
export const guaranteesSelector = (state: RootState) => state.ui.matchingData.guarantees;