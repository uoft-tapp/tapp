import {
    FETCH_POSTINGS_SUCCESS,
    FETCH_ONE_POSTING_SUCCESS,
    UPSERT_ONE_POSTING_SUCCESS,
    DELETE_ONE_POSTING_SUCCESS,
} from "../constants";
import { RawPosting } from "../defs/types";
import { createBasicReducerObject, createReducer } from "./utils";

interface PostingState {
    _modelData: RawPosting[];
}
const initialState: PostingState = {
    _modelData: [],
};

// basicReducers is an object whose keys are FETCH_SESSIONS_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject<RawPosting>(
    FETCH_POSTINGS_SUCCESS,
    FETCH_ONE_POSTING_SUCCESS,
    UPSERT_ONE_POSTING_SUCCESS,
    DELETE_ONE_POSTING_SUCCESS
);

export const postingsReducer = createReducer(initialState, basicReducers);
