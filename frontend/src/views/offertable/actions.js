import { SET_SELECTED_ROWS } from "./constants";

export const setSelectedRows = data => ({
    type: SET_SELECTED_ROWS,
    payload: data
});
