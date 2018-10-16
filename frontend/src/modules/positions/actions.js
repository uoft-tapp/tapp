import {
    UPDATE_POSITION_VALUE_REQUEST,
    UPDATE_POSITION_VALUE_SUCCESS,
    UPDATE_POSITION_VALUE_ERROR,
    FETCH_POSITIONS_SUCCESS,
    FETCH_POSITIONS_ERROR
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

const fetchPositionsSuccess = payload => ({ type: FETCH_POSITIONS_SUCCESS, payload })
const fetchPositionsError = payload => ({ type: FETCH_POSITIONS_ERROR, error: true, payload })

export const fetchPositions = () => dispatch => {
    return fetch("/api/v1/positions")
        .then(res => res.json())
        .then(data => dispatch(fetchPositionsSuccess(data)))
        .catch(error => dispatch(fetchPositionsError(error)))
}
