import {
    FETCH_APPLICANTS_SUCCESS,
    FETCH_ONE_APPLICANT_SUCCESS,
    UPSERT_ONE_APPLICANT_SUCCESS,
    DELETE_ONE_APPLICANT_SUCCESS,
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
const basicReducers = createBasicReducerObject<RawApplicant>(
    FETCH_APPLICANTS_SUCCESS,
    FETCH_ONE_APPLICANT_SUCCESS,
    UPSERT_ONE_APPLICANT_SUCCESS,
    DELETE_ONE_APPLICANT_SUCCESS
);

export const applicantsReducer = createReducer(initialState, basicReducers);
