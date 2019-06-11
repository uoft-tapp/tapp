import { 
    UPDATE_FIELD, 
    FETCH_POSITIONS_SUCCESS
} from "./constants"
import { error, success  } from "react-notification-system-redux"
import { errorProps } from "../notifications/constants"

// an action generator function that returns an action object
export const updateField = data => ({ type: UPDATE_FIELD, data })

// action used by applicant form view
export const createNewApplication = payload => async dispatch => {
    const res = await fetch("/api/v1/applicants", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (res.status === 201) {
        dispatch(success({title: "Success!", message: "Your application was submitted succesfully!",}))
    } else {
        dispatch(error({ ...errorProps, message: "An error occured with your submission: " + res.statusText })) 
        if (!!data) {        
            Object.keys(data).map( (key) => dispatch(
                error({ ...errorProps, message: key + ": " + data[key]  }))
            )
        }
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

