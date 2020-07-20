import { SET_SELECTED_DDAH_TABLE_ROWS } from "./constants";
import { DdahsTableType } from "./reducers";

// actions
export const setSelectedRows = (data: number[]) => ({
    type: SET_SELECTED_DDAH_TABLE_ROWS,
    payload: data,
});

// selectors
export const ddahTableSelector = (state: any) =>
    state.ui.ddahsTable as DdahsTableType;
