import { UPDATE_FIELD, FETCH_POSITIONS_SUCCESS } from "./constants";
import { error, success } from "react-notification-system-redux";
import { errorProps } from "../notifications/constants";
import { apiGET, apiPOST } from "../../libs/apiUtils";

// an action generator function that returns an action object
export const updateField = data => ({ type: UPDATE_FIELD, data });

// action used by applicant form view
export const createNewApplication = payload => async dispatch => {
    try {
        // if this await finishes, it means the server returned a `status === "success"`
        await apiPOST("/applicants", payload);
        dispatch(
            success({
                title: "Success!",
                message: "Your application was submitted succesfully!"
            })
        );
    } catch (e) {
        dispatch(error({ ...errorProps, message: e.toString() }));
    }
};

// action used by applicant positions view
export const fetchPositionsSuccess = payload => ({
    type: FETCH_POSITIONS_SUCCESS,
    payload
});

export const fetchPositions = () => async dispatch => {
    try {
        const data = await apiGET("/positions");
        dispatch(fetchPositionsSuccess(data));
    } catch (e) {
        dispatch(error({ ...errorProps, message: e.toString() }));
    }
};
