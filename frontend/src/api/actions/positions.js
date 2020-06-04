import PropTypes from "prop-types";
import {
    FETCH_POSITIONS_SUCCESS,
    FETCH_ONE_POSITION_SUCCESS,
    UPSERT_ONE_POSITION_SUCCESS,
    DELETE_ONE_POSITION_SUCCESS,
} from "../constants";
import { fetchError, upsertError, deleteError } from "./errors";
import {
    actionFactory,
    validatedApiDispatcher,
    arrayToHash,
    flattenIdFactory,
    splitObjByProps,
} from "./utils";
import { apiGET, apiPOST } from "../../libs/apiUtils";
import { positionsReducer } from "../reducers/positions";
import { createSelector } from "reselect";
import { instructorsSelector } from "./instructors";
import { contractTemplatesSelector } from "./contract_templates";
import { activeRoleSelector } from "./users";
import { applicantsSelector } from "./applicants";

// actions
const fetchPositionsSuccess = actionFactory(FETCH_POSITIONS_SUCCESS);
const fetchOnePositionSuccess = actionFactory(FETCH_ONE_POSITION_SUCCESS);
const upsertOnePositionSuccess = actionFactory(UPSERT_ONE_POSITION_SUCCESS);
const deleteOnePositionSuccess = actionFactory(DELETE_ONE_POSITION_SUCCESS);

// dispatchers
export const fetchPositions = validatedApiDispatcher({
    name: "fetchPositions",
    description: "Fetch positions",
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: () => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const role = activeRoleSelector(getState());
        const data = await apiGET(
            `/${role}/sessions/${activeSessionId}/positions`
        );
        dispatch(fetchPositionsSuccess(data));
    },
});

export const fetchPosition = validatedApiDispatcher({
    name: "fetchPosition",
    description: "Fetch position",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => fetchError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const role = activeRoleSelector(getState());
        const data = await apiGET(
            `/${role}/sessions/${activeSessionId}/positions/${payload.id}`
        );
        dispatch(fetchOnePositionSuccess(data));
    },
});

// Some helper functions to convert the data that the UI uses
// into data that the API can use
const instructorsToInstructorIds = flattenIdFactory(
    "instructors",
    "instructor_ids",
    true
);
const contractTemplateToContractTemplateId = flattenIdFactory(
    "contract_template",
    "contract_template_id"
);

const instructorToInstructorId = flattenIdFactory(
    "instructor",
    "instructor_id"
);

const applicantToApplicantId = flattenIdFactory("applicant", "applicant_id");

function prepForApi(data) {
    const [ret, filtered] = splitObjByProps(data, ["instructor_preferences"]);

    if (filtered["instructor_preferences"]) {
        ret["instructor_preferences"] = filtered[
            "instructor_preferences"
        ].map((preference) =>
            applicantToApplicantId(instructorToInstructorId(preference))
        );
    }

    return contractTemplateToContractTemplateId(
        instructorsToInstructorIds(ret)
    );
}

export const upsertPosition = validatedApiDispatcher({
    name: "upsertPosition",
    description: "Add/insert position",
    propTypes: {},
    onErrorDispatch: (e) => upsertError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const role = activeRoleSelector(getState());
        const data = await apiPOST(
            `/${role}/sessions/${activeSessionId}/positions`,
            prepForApi(payload)
        );
        dispatch(upsertOnePositionSuccess(data));
    },
});

export const deletePosition = validatedApiDispatcher({
    name: "deletePosition",
    description: "Delete position",
    propTypes: { id: PropTypes.any.isRequired },
    onErrorDispatch: (e) => deleteError(e.toString()),
    dispatcher: (payload) => async (dispatch, getState) => {
        const { id: activeSessionId } = getState().model.sessions.activeSession;
        const role = activeRoleSelector(getState());
        const data = await apiPOST(
            `/${role}/sessions/${activeSessionId}/positions/delete`,
            prepForApi(payload)
        );
        dispatch(deleteOnePositionSuccess(data));
    },
});

// selectors

// Each reducer is given an isolated state; instead of needed to remember to
// pass the isolated state to each selector, `reducer._localStoreSelector` will intelligently
// search for and return the isolated state associated with `reducer`. This is not
// a standard redux function.
export const localStoreSelector = positionsReducer._localStoreSelector;
const _positionsSelector = createSelector(
    localStoreSelector,
    (state) => state._modelData
);
/**
 * Get the positions, but populate the `instructors` array with the full instructor
 * information.
 */
export const positionsSelector = createSelector(
    [
        _positionsSelector,
        instructorsSelector,
        contractTemplatesSelector,
        applicantsSelector,
    ],
    (positions, instructors, contractTemplates, applicants) => {
        // Hash the instructors by `id` for fast lookup
        const instructorsById = arrayToHash(instructors);
        const contractTemplatesById = arrayToHash(contractTemplates);
        const applicantsById = arrayToHash(applicants);

        // Leave all the data alone, except replace the `instructor_ids` list
        // with the full instructor data.
        return positions.map(
            ({
                instructor_ids,
                contract_template_id,
                instructor_preferences,
                ...rest
            }) => ({
                ...rest,
                instructors: instructor_ids.map((x) => instructorsById[x]),
                contract_template: contractTemplatesById[contract_template_id],
                instructor_preferences: (instructor_preferences || []).map(
                    ({ applicant_id, instructor_id, ...rest }) => ({
                        instructor: instructorsById[instructor_id],
                        applicant: applicantsById[applicant_id],
                        ...rest,
                    })
                ),
            })
        );
    }
);
