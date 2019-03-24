import { UPDATE_FIELD } from "./constants"
import { error } from "react-notification-system-redux"
import { errorProps } from "../notifications/constants"

// an action generator function that returns an action object
export const updateField = data => ({ type: UPDATE_FIELD, data })

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
        window.location = "/tapp/"
    } else {
        dispatch(error({ ...errorProps, message: res.statusText })) 
        if (!!data) {        
            Object.keys(data).map( (key) => dispatch(
                error({ ...errorProps, message: key + ": " + data[key]  }))
            )
        }
    }
}