import {
    FETCH_ASSIGNMENTS_SUCCESS,
    FETCH_ONE_ASSIGNMENT_SUCCESS,
    UPSERT_ONE_ASSIGNMENT_SUCCESS,
    DELETE_ONE_ASSIGNMENT_SUCCESS,
    FETCH_WAGE_CHUNKS_FOR_ASSIGNMENT_SUCCESS,
    UPSERT_WAGE_CHUNKS_FOR_ASSIGNMENT_SUCCESS,
} from "../constants";
import { RawAssignment, RawWageChunk } from "../defs/types";
import { createBasicReducerObject, createReducer, HasPayload } from "./utils";

interface AssignmentState {
    _modelData: RawAssignment[];
    _wageChunksByAssignmentId: Record<number, RawWageChunk[]>;
}
const initialState: AssignmentState = {
    _modelData: [],
    // Since we don't want to fetch all wage chunks all the time,
    // we fetch them on a per-assignment basis and store them here.
    _wageChunksByAssignmentId: {},
};

// basicReducers is an object whose keys are FETCH_SESSIONS_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject<RawAssignment>(
    FETCH_ASSIGNMENTS_SUCCESS,
    FETCH_ONE_ASSIGNMENT_SUCCESS,
    UPSERT_ONE_ASSIGNMENT_SUCCESS,
    DELETE_ONE_ASSIGNMENT_SUCCESS
);

/**
 * Given a list of all the wage chunks for a particular assignment,
 * sets the _wageChunksByAssignmentId hash appropriately.
 *
 * @param {*} state
 * @param {{payload: object}} action
 * @returns
 */
function setWageChunks(
    state: AssignmentState,
    action: HasPayload<RawWageChunk[]>
): AssignmentState {
    const assignmentId = (action.payload[0] || {}).assignment_id;
    if (!assignmentId) {
        return state;
    }
    return {
        ...state,
        _wageChunksByAssignmentId: {
            ...state._wageChunksByAssignmentId,
            [assignmentId]: action.payload,
        },
    };
}

export const assignmentsReducer = createReducer(initialState, {
    ...basicReducers,
    // wage chunks are closely associated with assignments, so their actions happen
    // here
    [FETCH_WAGE_CHUNKS_FOR_ASSIGNMENT_SUCCESS]: setWageChunks,
    [UPSERT_WAGE_CHUNKS_FOR_ASSIGNMENT_SUCCESS]: setWageChunks,
});
