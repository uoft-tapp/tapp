import {
    UPDATE_POSITION_VALUE_REQUEST,
    UPDATE_POSITION_VALUE_SUCCESS,
    UPDATE_POSITION_VALUE_ERROR
} from "./constants"

export const updatePositionValueRequest = payload => ({
    type: UPDATE_POSITION_VALUE_REQUEST,
    payload
})
export const updatePositionValueSuccess = payload => ({
    type: UPDATE_POSITION_VALUE_SUCCESS,
    payload
})
export const updatePositionValueError = payload => ({
    type: UPDATE_POSITION_VALUE_ERROR,
    payload
})
