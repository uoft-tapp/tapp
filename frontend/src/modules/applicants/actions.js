import { SELECT_APPLICANT, REMOVE_APPLICANT } from "./constants"

export const selectApplicant = payload => ({ type: SELECT_APPLICANT, payload })
export const removeApplicant = payload => ({ type: REMOVE_APPLICANT, payload })
