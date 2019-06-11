import { 
    UPDATE_FIELD, 
    FETCH_POSITIONS_SUCCESS
} from "./constants"
import { error, success  } from "react-notification-system-redux"
import { errorProps } from "../notifications/constants"

// an action generator function that returns an action object
export const updateField = data => ({ type: UPDATE_FIELD, data });

// action used by applicant form view
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
}

// action used by applicant positions view
export const fetchPositionsSuccess = payload => ({ type: FETCH_POSITIONS_SUCCESS, payload })
export const fetchPositions = () => async dispatch => {
    const res = await fetch("/api/v1/positions")
    const data = await res.json()
    if (res.status === 200) {
        dispatch(fetchPositionsSuccess(data))
    } else {
        dispatch(error({ ...errorProps, message: "Fetch Position Failure" }))
    }
}

// action used by applicant positions view
export const fetchPositionsSuccess = payload => ({ type: FETCH_POSITIONS_SUCCESS, payload })
export const fetchPositions = () => async dispatch => {
    const res = await fetch("/api/v1/positions")
    const data = await res.json()
    if (res.status === 200) {
        dispatch(fetchPositionsSuccess(data))
    } else {
        dispatch(error({ ...errorProps, message: "Fetch Position Failure" }))
    }
}

