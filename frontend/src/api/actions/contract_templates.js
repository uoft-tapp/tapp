import PropTypes from "prop-types";
import {
    FETCH_CONTRACT_TEMPLATES_SUCCESS,
    UPSERT_ONE_CONTRACT_TEMPLATE_SUCCESS,
    DELETE_ONE_CONTRACT_TEMPLATE_SUCCESS,
    FETCH_ALL_CONTRACT_TEMPLATES_SUCCESS
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    runOnActiveSessionChange,
    validatedApiDispatcher
} from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";
import { contractTemplatesReducer } from "../reducers/contract_templates";
import { createSelector } from "reselect";

// actions
const fetchContractTemplatesSuccess = actionFactory(
    FETCH_CONTRACT_TEMPLATES_SUCCESS
);
const fetchAllContractTemplatesSuccess = actionFactory(
    FETCH_ALL_CONTRACT_TEMPLATES_SUCCESS
);
const upsertOneContractTemplateSuccess = actionFactory(
    UPSERT_ONE_CONTRACT_TEMPLATE_SUCCESS
);
const deleteOneContractTemplateSuccess = actionFactory(
    DELETE_ONE_CONTRACT_TEMPLATE_SUCCESS
);

// dispatchers
export const fetchContractTemplates = validatedApiDispatcher({
    name: "fetchContractTemplates",
    description: "Fetch contract_templates",
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(
            `/sessions/${activeSessionId}/contract_templates`
        );
        dispatch(fetchContractTemplatesSuccess(data));
    }
});

export const upsertContractTemplate = validatedApiDispatcher({
    name: "upsertContractTemplate",
    description: "Add/insert contract_template",
    propTypes: {},
    onErrorDispatch: e => upsertError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/sessions/${activeSessionId}/contract_templates`,
            payload
        );
        dispatch(upsertOneContractTemplateSuccess(data));
    }
});

export const deleteContractTemplate = validatedApiDispatcher({
    name: "deleteContractTemplate",
    description: "Delete contract_template from a session",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => deleteError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/sessions/${activeSessionId}/contract_templates/delete`,
            payload
        );
        dispatch(deleteOneContractTemplateSuccess(data));
    }
});

export const fetchAllContractTemplates = validatedApiDispatcher({
    name: "fetchAllContractTemplates",
    description: "Fetch all available contract_templates",
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: () => async dispatch => {
        const data = await apiGET(`/available_contract_templates`);
        dispatch(fetchAllContractTemplatesSuccess(data));
    }
});

// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
export const localStoreSelector = contractTemplatesReducer._localStoreSelector;
export const contractTemplatesSelector = createSelector(
    localStoreSelector,
    state => state._modelData
);

// Any time the active session changes, we want to refetch
// all data. Calling `runOnActiveSessionChange` ensures that
// when the active session changes all data is re-fetched
runOnActiveSessionChange(fetchContractTemplates);
