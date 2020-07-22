import PropTypes from "prop-types";
import {
    FETCH_CONTRACT_TEMPLATES_SUCCESS,
    UPSERT_ONE_CONTRACT_TEMPLATE_SUCCESS,
    DELETE_ONE_CONTRACT_TEMPLATE_SUCCESS,
    FETCH_ALL_CONTRACT_TEMPLATES_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import { actionFactory, validatedApiDispatcher } from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";
import { contractTemplatesReducer } from "../reducers/contract_templates";
import { createSelector } from "reselect";
import { activeRoleSelector } from "./users";
import { bytesToBase64 } from "../mockAPI/utils";

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
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(
            `/${role}/sessions/${activeSessionId}/contract_templates`
        );
        dispatch(fetchContractTemplatesSuccess(data));
        return data;
    },
});

export const upsertContractTemplate = validatedApiDispatcher({
    name: "upsertContractTemplate",
    description: "Add/insert contract_template",
    propTypes: {},
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/${role}/sessions/${activeSessionId}/contract_templates`,
            payload
        );
        dispatch(upsertOneContractTemplateSuccess(data));
        return data;
    },
});

export const deleteContractTemplate = validatedApiDispatcher({
    name: "deleteContractTemplate",
    description: "Delete contract_template from a session",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/${role}/sessions/${activeSessionId}/contract_templates/delete`,
            payload
        );
        dispatch(deleteOneContractTemplateSuccess(data));
        return data;
    },
});

export const fetchAllContractTemplates = validatedApiDispatcher({
    name: "fetchAllContractTemplates",
    description: "Fetch all available contract_templates",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(`/${role}/available_contract_templates`);
        dispatch(fetchAllContractTemplatesSuccess(data));
        return data;
    },
});

export const previewContractTemplate = validatedApiDispatcher({
    name: "previewContractTemplate",
    description:
        "Preview the html content of a contract template. No redux state is set by this call, but the contents of the template is returned.",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (template_id) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(
            `/${role}/contract_templates/${template_id}/view`
        );
        return data;
    },
});

export const downloadContractTemplate = validatedApiDispatcher({
    name: "downloadContractTemplate",
    description:
        "Download the content of a contract template. No redux state is set by this call, but a `File` object with the contents of the template is returned.",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (template_id) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = await apiGET(
            `/${role}/contract_templates/${template_id}/download`
        );
        // The data comes in encoded as base64, so we decode it as binary data.
        const content = new Uint8Array(
            atob(data.content)
                .split("")
                .map((x) => x.charCodeAt(0))
        );
        return new File([content], data.file_name, {
            type: data.mime_type,
        });
    },
});

export const uploadContractTemplate = validatedApiDispatcher({
    name: "uploadContractTemplate",
    description: "Upload the `File` object as a contract template",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (file) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());

        // We are expected to upload data in base64, so convert the file
        // object to base64.
        const file_name = file.name;
        const rawContent = new Uint8Array(await file.arrayBuffer());
        const content = bytesToBase64(rawContent);

        const data = await apiPOST(`/${role}/contract_templates/upload`, {
            file_name,
            content,
        });

        dispatch(fetchAllContractTemplatesSuccess(data));
        return data;
    },
});

// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
export const localStoreSelector = contractTemplatesReducer._localStoreSelector;
export const contractTemplatesSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData
);
export const allContractTemplatesSelector = createSelector(
    localStoreSelector,
    (state) => state.all
);
