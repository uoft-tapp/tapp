import { SET_SELECTED_ROWS } from "./constants";
import { createReducer } from "redux-create-reducer";
export { offerTableReducer };
interface OfferTableState {
    selectedAssignmentIds: number[];
}

// initialize the state of offer table
const initialState: OfferTableState = {
    selectedAssignmentIds: [],
};

const offerTableReducer = createReducer(initialState, {
    [SET_SELECTED_ROWS]: (state, action) => {
        return { ...state, selectedAssignmentIds: action.payload };
    },
});
