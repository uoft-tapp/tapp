import { SET_SELECTED_DDAH_TABLE_ROWS } from "./constants";
import { createReducer } from "redux-create-reducer";
export { ddahsTableReducer };
// initialize the state of offer table
const initialState = {
    selectedDdahIds: [] as number[],
};

const ddahsTableReducer = createReducer(initialState, {
    [SET_SELECTED_DDAH_TABLE_ROWS]: (state: any, action: any) => {
        return { ...state, selectedDdahIds: action.payload };
    },
});

export type DdahsTableType = typeof initialState;
