import {
    SELECT_APPLICANT_SUCCESS,
    REMOVE_APPLICANT_SUCCESS,
    VIEW_POSITION,
    SWITCH_POSITIONS
} from "./constants"
import { error } from "react-notification-system-redux"
import { errorProps } from "../notifications/constants"

export const selectApplicant = payload => dispatch => {
    // Call API
    dispatch(selectApplicantSuccess(payload))
}
export const selectApplicantSuccess = payload => ({ type: SELECT_APPLICANT_SUCCESS, payload })
export const selectApplicantError = payload => dispatch =>
    dispatch(error({ ...errorProps, message: payload.message }))
export const removeApplicant = payload => dispatch => {
    // Call API
    dispatch(removeApplicantSuccess(payload))
}
export const removeApplicantSuccess = payload => ({ type: REMOVE_APPLICANT_SUCCESS, payload })
export const removeApplicantError = payload => dispatch =>
    dispatch(error({ ...errorProps, message: payload.message }))

export const viewPosition = payload => ({ type: VIEW_POSITION, payload })
export const switchPositions = () => ({ type: SWITCH_POSITIONS })
