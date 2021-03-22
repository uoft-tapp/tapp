import {
    FETCH_APPLICANTS_SUCCESS,
    FETCH_ONE_APPLICANT_SUCCESS,
    UPSERT_ONE_APPLICANT_SUCCESS,
    DELETE_ONE_APPLICANT_SUCCESS,
    ADD_APPLICANT_TO_SESSION_SUCCESS,
} from "../constants";
import { RawApplicant } from "../defs/types";
import { createBasicReducerObject, createReducer } from "./utils";

export interface ApplicantsState {
    _modelData: RawApplicant[];
}
const initialState: ApplicantsState = {
    _modelData: [],
};

// basicReducers is an object whose keys are FETCH_SESSIONS_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject(
    FETCH_APPLICANTS_SUCCESS,
    FETCH_ONE_APPLICANT_SUCCESS,
    UPSERT_ONE_APPLICANT_SUCCESS,
    DELETE_ONE_APPLICANT_SUCCESS
);

/**
 * Produces an array that is the union of `target` and `source`.
 *
 * @param {object[]} target
 * @param {object[]} source
 */
function insertIfMissing(target: RawApplicant[], source: RawApplicant) {
    const missingItems = [];
    for (let item of target) {
        if (!source.some((x) => x.id === item.id)) {
            // the current item is new
            missingItems.push(item);
        }
    }
    if (missingItems.length > 0) {
        return target.concat(missingItems);
    }
    return target;
}

export const applicantsReducer = createReducer(initialState, {
    ...basicReducers,
    [ADD_APPLICANT_TO_SESSION_SUCCESS]: (state, action) => ({
        ...state,
        _modelData: insertIfMissing(state._modelData, action.payload),
    }),
});
