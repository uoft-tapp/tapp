import {
  FETCH_INSTRUCTORS_SUCCESS,
  FETCH_INSTRUCTORS_ERROR
} from "./constants"

export const fetchInstructorsSuccess = payload => ({ type: FETCH_INSTRUCTORS_SUCCESS, payload })
export const fetchInstructorsError = payload => ({
  type: FETCH_INSTRUCTORS_ERROR,
  error: true,
  payload
})
export const fetchInstructors = () => dispatch => {
  return fetch("/api/v1/instructors")
      .then(res => res.json())
      .then(data => { 
          dispatch(fetchInstructorsSuccess(data)) 
      })
      .catch(error => dispatch(fetchInstructorsError(error)))
}