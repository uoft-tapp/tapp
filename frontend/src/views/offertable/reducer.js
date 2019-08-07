import { UPDATE_SELECTED_ROWS, UPDATE_SEARCH_TEXT } from "./constants";
import { createReducer } from "redux-create-reducer";

// initialize the state of offer table
const initialState = {
    selectedRows: [],
    filters: {
        first_name: "",
        last_name: "",
        email: "",
        first_time_ta: "",
        nag_count: ""
    }
};

const reducer = createReducer(initialState, {
    [UPDATE_SELECTED_ROWS]: (state, action) => {
        return { ...state, selectedRows: action.rows };
    },
    [UPDATE_SEARCH_TEXT]: (state, action) => {
        let newFilters = {};
        for (var key in state.fields) {
            if (key === action.colunmName) {
                newFilters[key] = action.searchBoxInput;
            } else {
                newFilters[key] = state.searchBoxInput;
            }
        }
        return { ...state, filters: newFilters };
    }
});

// must import this reducer in the rootReducer file for the state tree to be created
export default reducer;
