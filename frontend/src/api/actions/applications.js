import PropTypes from "prop-types";
import {
    FETCH_APPLICATIONS_SUCCESS,
    FETCH_ONE_APPLICATION_SUCCESS,
    UPSERT_ONE_APPLICATION_SUCCESS,
    DELETE_ONE_APPLICATION_SUCCESS
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    runOnActiveSessionChange,
    validatedApiDispatcher
} from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";

// actions
const fetchApplicationsSuccess = actionFactory(FETCH_APPLICATIONS_SUCCESS);
const fetchOneApplicationSuccess = actionFactory(FETCH_ONE_APPLICATION_SUCCESS);
const upsertOneApplicationSuccess = actionFactory(
    UPSERT_ONE_APPLICATION_SUCCESS
);
const deleteOneApplicationSuccess = actionFactory(
    DELETE_ONE_APPLICATION_SUCCESS
);

// dispatchers
export const fetchApplications = validatedApiDispatcher({
    name: "fetchApplications",
    description: "Fetch applications",
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(`/sessions/${activeSessionId}/applications`);
        dispatch(fetchApplicationsSuccess(data));
    }
});

export const fetchApplication = validatedApiDispatcher({
    name: "fetchApplication",
    description: "Fetch application",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(
            `/sessions/${activeSessionId}/applications/${payload.id}`
        );
        dispatch(fetchOneApplicationSuccess(data));
    }
});

export const upsertApplication = validatedApiDispatcher({
    name: "upsertApplication",
    description: "Add/insert application",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => upsertError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/sessions/${activeSessionId}/applications`,
            payload
        );
        dispatch(upsertOneApplicationSuccess(data));
    }
});

export const deleteApplication = validatedApiDispatcher({
    name: "deleteApplication",
    description: "Delete application",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => deleteError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/sessions/${activeSessionId}/applications/delete`,
            payload
        );
        dispatch(deleteOneApplicationSuccess(data));
    }
});

// selectors
export const applicationsSelector = state => state._modelData;

// Any time the active session changes, we want to refetch
// all data. Calling `runOnActiveSessionChange` ensures that
// when the active session changes all data is re-fetched
runOnActiveSessionChange(fetchApplications);
