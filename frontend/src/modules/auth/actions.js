import { LOGOUT, LOGIN_SUCCESS } from "./constants"
import { error } from "react-notification-system-redux"
import { errorProps } from "../notifications/constants"

export const loginRequest = () => dispatch => {
    // Call API
    dispatch(loginSuccess())
}
export const loginSuccess = () => ({ type: LOGIN_SUCCESS })
export const loginError = payload => dispatch =>
    dispatch(error({ ...errorProps, mesage: payload.message }))
export const logout = () => ({ type: LOGOUT })
