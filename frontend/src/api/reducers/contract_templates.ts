import {
    FETCH_CONTRACT_TEMPLATES_SUCCESS,
    FETCH_ONE_CONTRACT_TEMPLATE_SUCCESS,
    UPSERT_ONE_CONTRACT_TEMPLATE_SUCCESS,
    DELETE_ONE_CONTRACT_TEMPLATE_SUCCESS,
    FETCH_ALL_CONTRACT_TEMPLATES_SUCCESS,
} from "../constants";
import { RawContractTemplate } from "../defs/types";
import { createBasicReducerObject, createReducer, HasPayload } from "./utils";

interface ContractTemplateState {
    _modelData: RawContractTemplate[];
    all: { template_file: string }[];
}

const initialState: ContractTemplateState = {
    _modelData: [],
    all: [],
};

// basicReducers is an object whose keys are FETCH_*_SUCCESS, etc,
// and values are the corresponding reducer functions
const basicReducers = createBasicReducerObject<RawContractTemplate>(
    FETCH_CONTRACT_TEMPLATES_SUCCESS,
    FETCH_ONE_CONTRACT_TEMPLATE_SUCCESS,
    UPSERT_ONE_CONTRACT_TEMPLATE_SUCCESS,
    DELETE_ONE_CONTRACT_TEMPLATE_SUCCESS
);

export const contractTemplatesReducer = createReducer(initialState, {
    ...basicReducers,
    [FETCH_ALL_CONTRACT_TEMPLATES_SUCCESS]: (
        state,
        action: HasPayload<{ template_file: string }[]>
    ) => ({
        ...state,
        all: action.payload,
    }),
});
