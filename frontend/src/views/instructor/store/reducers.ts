import {
    SET_INSTRUCTOR_ACTIVE_POSITION,
    SET_INSTRUCTOR_SELECTED_ROWS,
} from "./constants";
import { createReducer } from "redux-create-reducer";

interface InstructorUIState {
    selectedDdahIds: number[];
    activePositionId: number | null;
}

// initialize the state of offer table
const initialState: InstructorUIState = {
    selectedDdahIds: [],
    activePositionId: null,
};

const instructorUIReducer = createReducer(initialState, {
    [SET_INSTRUCTOR_SELECTED_ROWS]: (state, action) => {
        return { ...state, selectedDdahIds: action.payload };
    },
    [SET_INSTRUCTOR_ACTIVE_POSITION]: (state, action) => {
        return { ...state, activePositionId: action.payload };
    },
});

export default instructorUIReducer;
