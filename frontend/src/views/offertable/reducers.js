import { SET_SELECTED_ROWS } from "./constants";
import { createReducer } from "redux-create-reducer";

// initialize the state of offer table
const initialState = {
    selectedAssignmentIds: []
};

const offerTableReducer = createReducer(initialState, {
    [SET_SELECTED_ROWS]: (state, action) => {
        return { ...state, selectedAssignmentIds: action.payload };
    }
});

export default offerTableReducer;
