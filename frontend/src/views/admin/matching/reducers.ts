import { SET_SELECTED_ROWS } from "./constants";
import { createReducer } from "redux-create-reducer";
import { Match, AppointmentGuaranteeStatus } from "./types";

interface MatchingDataState {
    matches: Match[];
    guarantees: AppointmentGuaranteeStatus[];
}

// initialize the state of offer table
const initialState: MatchingDataState = {
    matches: [],
    guarantees: []
};

const matchingDataReducer = createReducer(initialState, {
    [SET_SELECTED_ROWS]: (state, action) => {
        return { ...state, matches: action.payload };
    },
});

export default matchingDataReducer;
