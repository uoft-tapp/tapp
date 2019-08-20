import { SEND_SELECTED_ROWS } from "./constants";

export const sendSelectedRows = data => ({
    type: SEND_SELECTED_ROWS,
    payload: data
});

