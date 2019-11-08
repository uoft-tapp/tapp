import PropTypes from "prop-types";
import {
    SELECT_APPLICANT_SUCCESS,
    REMOVE_APPLICANT_SUCCESS,
    CHANGE_INSTRUCTOR_PREF_SUCCESS,
    VIEW_POSITION,
    SWITCH_POSITIONS
} from "../constants";
import { 
    applicantsSelector,
    applicationsSelector,
} from "./"
import { upsertError } from "./errors";
import { actionFactory, validatedApiDispatcher } from "./utils";
import { createSelector } from "reselect";
// import { apiGET, apiPUT } from "../../libs/apiUtils";

// actions
const selectApplicantSuccess = actionFactory(SELECT_APPLICANT_SUCCESS);
const removeApplicantSuccess = actionFactory(REMOVE_APPLICANT_SUCCESS);
const changeInstructorPrefSuccess = actionFactory(
    CHANGE_INSTRUCTOR_PREF_SUCCESS
);

// dispatchers
export const selectApplicant = validatedApiDispatcher({
    name: "selectApplicant",
    description: "Select an applicant for a course",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => upsertError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        // const { id: activeSessionId } = getState().model.sessions.activeSession;
        // const data = await apiPUT(
        //     `/sessions/${activeSessionId}/applicants`,
        //     payload
        // );
        //
        // TODO: payload is passed in to reducer as a temporal fix
        // just so it's working. should disscuss this
        dispatch(selectApplicantSuccess(payload));
    }
});

export const removeApplicant = validatedApiDispatcher({
    name: "removeApplicant",
    description: "Remove an applicant from selected list",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => upsertError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        // const { id: activeSessionId } = getState().model.sessions.activeSession;
        // const data = await apiPUT(
        //     `/sessions/${activeSessionId}/applicants`,
        //     payload
        // );
        dispatch(removeApplicantSuccess(payload));
    }
});

export const changeInstructorPref = validatedApiDispatcher({
    name: "changeInstructorPref",
    description: "Change instructor's preference for an applicant",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: e => upsertError(e.toString()),
    dispatcher: payload => async (dispatch, getState) => {
        // const { id: activeSessionId } = getState().model.sessions.activeSession;
        // const data = await apiPUT(
        //     `/sessions/${activeSessionId}/instructor`,
        //     payload
        // );
        dispatch(changeInstructorPrefSuccess(payload));
    }
});

export const viewPosition = payload => ({ type: VIEW_POSITION, payload });
export const switchPositions = () => ({ type: SWITCH_POSITIONS });

export const applicantsByPositionSelector = createSelector(
    applicantsSelector,
    applicationsSelector,
    (_, positionId) => positionId,
    (applicants, applications, positionId) => {
        debugger;

        const matchedApplications = applications.filter(({ position_id }) => positionId === position_id)
        const selectedApplications = matchedApplications.filter(({ status }) => status === "selected")
        const availableApplications = matchedApplications.filter(({ status }) => status === "available")

        const applicantsData = {
            available: [],
            selected: []
        }
        applicants.forEach(applicant => {
            debugger;
            let matchedApplication = {};
            if (matchedApplication = selectedApplications.find(({ applicant_id }) => applicant_id === applicant.id)) {
                debugger;
                const data = {
                    last_name: applicant.last_name,
                    first_name: applicant.first_name,
                    department: matchedApplication.department,
                    program: matchedApplication.program,
                    year: "year temp",
                    preference: "pref temp",
                    instructor_pref: 1,
                    other: []
                };
                applicantsData.selected.push(data)
            } else if (matchedApplication = availableApplications.find(({ applicant_id }) => applicant_id === applicant.id)) {
                debugger;
                const data = {
                    lastName: applicant.last_name,
                    firstName: applicant.first_name,
                    department: matchedApplication.department,
                    program: matchedApplication.program,
                    year: "year temp",
                    preference: "pref temp",
                    instructor_pref: 1,
                    other: ["CSC108"]
                };
                applicantsData.available.push(data)
            }
        })
        return applicantsData
    }
);