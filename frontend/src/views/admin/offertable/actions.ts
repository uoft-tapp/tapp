import { RootState } from "../../../rootReducer";
import { SET_SELECTED_ROWS } from "./constants";

// actions
export const setSelectedRows = (data: number[]) => ({
    type: SET_SELECTED_ROWS,
    payload: data,
});

// selectors
export const offerTableSelector = (state: RootState) => state.ui.offerTable;
