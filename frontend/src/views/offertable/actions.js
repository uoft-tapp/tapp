import { UPDATE_SELECTED_ROWS, UPDATE_SEARCH_TEXT } from "./constants";

export const updateSelectedRows = data => ({
    type: UPDATE_SELECTED_ROWS,
    rows: data
});

export const updateSearchText = (colunmName, searchBoxInput) => ({
    type: UPDATE_SEARCH_TEXT,
    column: colunmName,
    value: searchBoxInput
});
