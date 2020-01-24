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
    arrayToHash,
    validatedApiDispatcher,
    flattenIdFactory,
    splitObjByProps
} from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";
import { applicationsReducer } from "../reducers/applications";
import { createSelector } from "reselect";
import { applicantsSelector } from "./applicants";
import { activeRoleSelector } from "./users";
import { positionsSelector } from "./positions";

// actions
const fetchApplicationsSuccess = actionFactory(FETCH_APPLICATIONS_SUCCESS);
const fetchOneApplicationSuccess = actionFactory(FETCH_ONE_APPLICATION_SUCCESS);
const upsertOneApplicationSuccess = actionFactory(
    UPSERT_ONE_APPLICATION_SUCCESS
);
const deleteOneApplicationSuccess = actionFactory(
    DELETE_ONE_APPLICATION_SUCCESS
);

const applicantToApplicantId = flattenIdFactory("applicant", "applicant_id");
const positionToPositionId = flattenIdFactory("position", "position_id");
function prepForApi(data) {
    const [ret, filtered] = splitObjByProps(data, ["position_preferences"]);

    if (filtered["position_preferences"]) {
        ret["position_preferences"] = filtered[
            "position_preferences"
        ].map(preference => positionToPositionId(preference));
    }

    return applicantToApplicantId(ret);
}

// dispatchers
export const fetchApplications = validatedApiDispatcher({
    name: "fetchApplications",
    description: "Fetch applications",
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(
            `/${role}/sessions/${activeSessionId}/applications`
        );
        dispatch(fetchApplicationsSuccess(data));
    }
});

export const fetchApplication = validatedApiDispatcher({
    name: "fetchApplication",
    description: "Fetch application",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => fetchError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiGET(
            `/${role}/sessions/${activeSessionId}/applications/${payload.id}`
        );
        dispatch(fetchOneApplicationSuccess(data));
    }
});

export const upsertApplication = validatedApiDispatcher({
    name: "upsertApplication",
    description: "Add/insert application",
    propTypes: {},
    onErrorDispatch: e => upsertError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        const role = activeRoleSelector(getState());
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/${role}/sessions/${activeSessionId}/applications`,
            prepForApi(payload)
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
        const role = activeRoleSelector(getState());
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const data = await apiPOST(
            `/${role}/sessions/${activeSessionId}/applications/delete`,
            prepForApi(payload)
        );
        dispatch(deleteOneApplicationSuccess(data));
    }
});

// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
export const localStoreSelector = applicationsReducer._localStoreSelector;
export const _applicationsSelector = createSelector(
    localStoreSelector,
    state => state._modelData
);

// Get the current list of applications and recompute `applicant_id` and `position_id`
// to have corresponding `applicant` and `position` objects
export const applicationsSelector = createSelector(
    [_applicationsSelector, applicantsSelector, positionsSelector],
    (applications, applicants, positions) => {
        if (applications.length === 0) {
            return [];
        }

        const applicantsById = arrayToHash(applicants);
        const positionsById = arrayToHash(positions);

        // Change `applicant_id` to the corresponding `applicant` object
        // and similarly, change each `position_id` in each entry of
        // `position_preferences` to corresponding `position` object.
        return applications.map(
            ({ position_preferences, applicant_id, ...rest }) => ({
                ...rest,
                applicant: applicantsById[applicant_id] || {},
                position_preferences: (position_preferences || []).map(
                    ({ position_id, ...rest }) => ({
                        position: positionsById[position_id],
                        ...rest
                    })
                )
            })
        );
    }
);
