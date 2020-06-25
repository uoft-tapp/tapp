import {
    FETCH_CONTRACT_TEMPLATES_SUCCESS,
    FETCH_ONE_CONTRACT_TEMPLATE_SUCCESS,
    UPSERT_ONE_CONTRACT_TEMPLATE_SUCCESS,
    DELETE_ONE_CONTRACT_TEMPLATE_SUCCESS,
    FETCH_ALL_CONTRACT_TEMPLATES_SUCCESS,
} from "../constants";
import { createBasicReducerObject, createReducer } from "./utils";

const initialState = {
    _modelData: [],
    all: [],
};

// basicReducers is an object whose keys are FETCH_*_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject(
    FETCH_CONTRACT_TEMPLATES_SUCCESS,
    FETCH_ONE_CONTRACT_TEMPLATE_SUCCESS,
    UPSERT_ONE_CONTRACT_TEMPLATE_SUCCESS,
    DELETE_ONE_CONTRACT_TEMPLATE_SUCCESS
);

export const contractTemplatesReducer = createReducer(initialState, {
    ...basicReducers,
    [FETCH_ALL_CONTRACT_TEMPLATES_SUCCESS]: (state, action) => ({
        ...state,
        all: action.payload,
    }),
});
