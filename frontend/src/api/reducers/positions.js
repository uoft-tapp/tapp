import {
    FETCH_POSITIONS_SUCCESS,
    FETCH_ONE_POSITION_SUCCESS,
    UPSERT_ONE_POSITION_SUCCESS,
    DELETE_ONE_POSITION_SUCCESS,
    ADD_INSTRUCTOR_TO_POSITION_SUCCESS
} from "../constants";
import { createBasicReducerObject, createReducer } from "./utils";

const initialState = {
    _modelData: []
};

// basicReducers is an object whose keys are FETCH_SESSIONS_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject(
    FETCH_POSITIONS_SUCCESS,
    FETCH_ONE_POSITION_SUCCESS,
    UPSERT_ONE_POSITION_SUCCESS,
    DELETE_ONE_POSITION_SUCCESS
);

export const positionsReducer = createReducer(initialState, {
    ...basicReducers,
    [ADD_INSTRUCTOR_TO_POSITION_SUCCESS]: (state, action) => {
        const positionId = action.payload.position.id;
        const instructors = action.payload.instructors;

        // update the instructors list, but only if we're in the
        // right position
        function updateInstructors(position) {
            if (position.id !== positionId) {
                return position;
            }
            return {
                ...position,
                instructors: instructors
            };
        }

        return {
            ...state,
            _modelData: state._modelData.map(updateInstructors)
        };
    }
});
