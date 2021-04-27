import { SET_SELECTED_POSITION } from "./constants";
import { createReducer } from "redux-create-reducer";

interface PositionsTableState {
    selectedPositionIds: number | null;
}

// initialize the state of offer table
const initialState: PositionsTableState = {
    selectedPositionIds: null,
};

const positionsTableReducer = createReducer(initialState, {
    [SET_SELECTED_POSITION]: (state, action) => {
        return { ...state, selectedPositionIds: action.payload };
    },
});

export default positionsTableReducer;
