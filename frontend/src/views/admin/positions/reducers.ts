import { SET_SELECTED_POSITION_ROWS } from "./constants";
import { createReducer } from "redux-create-reducer";

interface PositionsTableState {
    selectedPositionIds: number[];
}

// initialize the state of offer table
const initialState: PositionsTableState = {
    selectedPositionIds: [],
};

const positionsTableReducer = createReducer(initialState, {
    [SET_SELECTED_POSITION_ROWS]: (state, action) => {
        return { ...state, selectedPositionIds: action.payload };
    },
});

export default positionsTableReducer;
