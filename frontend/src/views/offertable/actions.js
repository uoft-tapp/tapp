import { SET_SELECTED_ROWS } from "./constants";

// actions
export const setSelectedRows = (data) => ({
    type: SET_SELECTED_ROWS,
    payload: data,
});

// selectors
export const offerTableSelector = (state) => state.ui.offerTable;
