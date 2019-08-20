import { SEND_SELECTED_ROWS } from "./constants";
import { createReducer } from "redux-create-reducer";

// initialize the state of offer table
const initialState = {
    selectedIds: []
};

const reducer = createReducer(initialState, {
    [SEND_SELECTED_ROWS]: (state, action) => {
        return { ...state, selectedIds: action.payload };
    }
});

// must import this reducer in the rootReducer file for the state tree to be created
export default reducer;
