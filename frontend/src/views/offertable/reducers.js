import { SET_SELECTED_ROWS } from "./constants";
import { createReducer } from "redux-create-reducer";

// initialize the state of offer table
const initialState = {
    selectedIds: []
};

const offerTableReducer = createReducer(initialState, {
    [SET_SELECTED_ROWS]: (state, action) => {
        return { ...state, selectedIds: action.payload };
    }
});

export default offerTableReducer;
