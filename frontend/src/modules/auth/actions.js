import { LOGOUT, LOGIN_REQUEST, LOGIN_SUCCESS } from "./constants"

export const loginRequest = () => ({ type: LOGIN_REQUEST })
export const loginSuccess = () => ({ type: LOGIN_SUCCESS })
export const logout = () => ({ type: LOGOUT })
