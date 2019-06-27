import { UPDATE_FIELD } from "./constants";
import { error, success } from "react-notification-system-redux";
import { errorProps } from "../notifications/constants";
import { apiPOST } from "../../libs/apiUtils";

// an action generator function that returns an action object
export const updateField = data => ({ type: UPDATE_FIELD, data });

export const createNewApplication = payload => async dispatch => {
    try {
        // if this await finishes, it means the server returned a `status === "success"`
        // message
        await apiPOST("/applicants", payload);
        dispatch(
            success({
                title: "Success!",
                message: "Your application was submitted succesfully!"
            })
        );
    } catch (e) {
        dispatch(
            error({
                ...errorProps,
                message: e.toString()
            })
        );
    }
};
