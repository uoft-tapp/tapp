import {
    FETCH_CONTRACT_TEMPLATES_SUCCESS,
    UPSERT_ONE_CONTRACT_TEMPLATE_SUCCESS,
    DELETE_ONE_CONTRACT_TEMPLATE_SUCCESS,
    FETCH_ALL_CONTRACT_TEMPLATES_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    HasId,
    isSameSession,
    validatedApiDispatcher,
} from "./utils";
import { apiGET, apiPOST } from "../../libs/api-utils";
import { contractTemplatesReducer } from "../reducers/contract_templates";
import { createSelector } from "reselect";
import { activeRoleSelector } from "./users";
import { bytesToBase64 } from "../mockAPI/utils";
import { activeSessionSelector } from "./sessions";
import {
    ContractTemplate,
    RawAttachment,
    RawContractTemplate,
} from "../defs/types";

// actions
export const fetchContractTemplatesSuccess = actionFactory(
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

const MissingActiveSessionError = new Error(
    "Cannot interact with Contract Templates without an active session"
);
// dispatchers
export const fetchContractTemplates = validatedApiDispatcher({
    name: "fetchContractTemplates",
    description: "Fetch contract_templates",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const activeSession = activeSessionSelector(getState());
        if (activeSession == null) {
            throw MissingActiveSessionError;
        }
        const { id: activeSessionId } = activeSession;
        const data = (await apiGET(
            `/${role}/sessions/${activeSessionId}/contract_templates`
        )) as RawContractTemplate[];
        // Between the time we started fetching and the time the data arrived, the active session may have
        // changed. Make sure the correct active session is set before updating the data.
        if (isSameSession(activeSessionId, getState)) {
            dispatch(fetchContractTemplatesSuccess(data));
        }
        return data;
    },
});

export const upsertContractTemplate = validatedApiDispatcher({
    name: "upsertContractTemplate",
    description: "Add/insert contract_template",
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher:
        (payload: Partial<ContractTemplate>) => async (dispatch, getState) => {
            const role = activeRoleSelector(getState());
            const activeSession = activeSessionSelector(getState());
            if (activeSession == null) {
                throw MissingActiveSessionError;
            }
            const { id: activeSessionId } = activeSession;
            const data = (await apiPOST(
                `/${role}/sessions/${activeSessionId}/contract_templates`,
                payload
            )) as RawContractTemplate;
            dispatch(upsertOneContractTemplateSuccess(data));
            return data;
        },
});

export const deleteContractTemplate = validatedApiDispatcher({
    name: "deleteContractTemplate",
    description: "Delete contract_template from a session",
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload: HasId) => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const activeSession = activeSessionSelector(getState());
        if (activeSession == null) {
            throw MissingActiveSessionError;
        }
        const { id: activeSessionId } = activeSession;
        const data = (await apiPOST(
            `/${role}/sessions/${activeSessionId}/contract_templates/delete`,
            payload
        )) as RawContractTemplate;
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
        const data = (await apiGET(
            `/${role}/available_contract_templates`
        )) as { template_file: string }[];
        dispatch(fetchAllContractTemplatesSuccess(data));
        return data;
    },
});

export const previewContractTemplate = validatedApiDispatcher({
    name: "previewContractTemplate",
    description:
        "Preview the html content of a contract template. No redux state is set by this call, but the contents of the template is returned.",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (template_id: number) => async (_dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/contract_templates/${template_id}/view`
        )) as string;
        return data;
    },
});

export const downloadContractTemplate = validatedApiDispatcher({
    name: "downloadContractTemplate",
    description:
        "Download the content of a contract template. No redux state is set by this call, but a `File` object with the contents of the template is returned.",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (template_id: number) => async (_dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const data = (await apiGET(
            `/${role}/contract_templates/${template_id}/download`
        )) as RawAttachment;
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
    dispatcher: (file: File) => async (dispatch, getState) => {
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
const localStoreSelector = contractTemplatesReducer._localStoreSelector;
export const contractTemplatesSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData as ContractTemplate[]
);
export const allContractTemplatesSelector = createSelector(
    localStoreSelector,
    (state) => state.all
);
