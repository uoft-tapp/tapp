import {
    SET_INSTRUCTOR_ACTIVE_POSITION,
    SET_INSTRUCTOR_DDAHS_FOR_EMAIL,
} from "./constants";
import { createReducer } from "redux-create-reducer";
export { instructorUIReducer };

interface InstructorUIState {
    selectedDdahForEmailIds: number[];
    activePositionId: number | null;
}

// initialize the state of offer table
const initialState: InstructorUIState = {
    selectedDdahForEmailIds: [],
    activePositionId: null,
};

const instructorUIReducer = createReducer(initialState, {
    [SET_INSTRUCTOR_DDAHS_FOR_EMAIL]: (state, action) => {
        return { ...state, selectedDdahForEmailIds: action.payload };
    },
    [SET_INSTRUCTOR_ACTIVE_POSITION]: (state, action) => {
        return { ...state, activePositionId: action.payload };
    },
});
