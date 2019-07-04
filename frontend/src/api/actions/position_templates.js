import PropTypes from "prop-types";
import {
    FETCH_POSITION_TEMPLATES_SUCCESS,
    FETCH_ONE_POSITION_TEMPLATE_SUCCESS,
    UPSERT_ONE_POSITION_TEMPLATE_SUCCESS,
    DELETE_ONE_POSITION_TEMPLATE_SUCCESS,
    FETCH_ALL_POSITION_TEMPLATES_SUCCESS
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    runOnActiveSessionChange,
    validatedApiDispatcher
} from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";
import { positionTemplatesReducer } from "../reducers/position_templates";
import { createSelector } from "reselect";

// actions
const fetchPositionTemplatesSuccess = actionFactory(
    FETCH_POSITION_TEMPLATES_SUCCESS
);
const fetchAllPositionTemplatesSuccess = actionFactory(
    FETCH_ALL_POSITION_TEMPLATES_SUCCESS
);
const fetchOnePositionTemplateSuccess = actionFactory(
    FETCH_ONE_POSITION_TEMPLATE_SUCCESS
);
const upsertOnePositionTemplateSuccess = actionFactory(
    UPSERT_ONE_POSITION_TEMPLATE_SUCCESS
);
const deleteOnePositionTemplateSuccess = actionFactory(
    DELETE_ONE_POSITION_TEMPLATE_SUCCESS
);

// dispatchers
export const fetchPositionTemplates = validatedApiDispatcher({
    name: "fetchPositionTemplates",
    description: "Fetch position_templates",
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(
            `/sessions/${activeSessionId}/position_templates`
        );
        dispatch(fetchPositionTemplatesSuccess(data));
    }
});

export const fetchPositionTemplate = validatedApiDispatcher({
    name: "fetchPositionTemplate",
    description: "Fetch position_template",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(
            `/sessions/${activeSessionId}/position_templates/${payload.id}`
        );
        dispatch(fetchOnePositionTemplateSuccess(data));
    }
});

export const upsertPositionTemplate = validatedApiDispatcher({
    name: "upsertPositionTemplate",
    description: "Add/insert position_template",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => upsertError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/sessions/${activeSessionId}/position_templates`,
            payload
        );
        dispatch(upsertOnePositionTemplateSuccess(data));
    }
});

export const deletePositionTemplate = validatedApiDispatcher({
    name: "deletePositionTemplate",
    description: "Delete position_template",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => deleteError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/sessions/${activeSessionId}/position_templates/delete`,
            payload
        );
        dispatch(deleteOnePositionTemplateSuccess(data));
    }
});

export const fetchAllPositionTemplates = validatedApiDispatcher({
    name: "fetchAllPositionTemplates",
    description: "Fetch all available position_templates",
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: () => async dispatch => {
        const data = await apiGET(`/available_position_templates`);
        dispatch(fetchAllPositionTemplatesSuccess(data));
    }
});

// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
export const localStoreSelector = positionTemplatesReducer._localStoreSelector;
export const positionTemplatesSelector = createSelector(
    localStoreSelector,
    state => state._modelData
);

// Any time the active session changes, we want to refetch
// all data. Calling `runOnActiveSessionChange` ensures that
// when the active session changes all data is re-fetched
runOnActiveSessionChange(fetchPositionTemplates);
