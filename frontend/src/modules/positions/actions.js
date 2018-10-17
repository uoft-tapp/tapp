import {
    FETCH_POSITIONS_SUCCESS,
    FETCH_POSITIONS_ERROR,
    SAVE_POSITIONS,
    SAVE_POSITIONS_SUCCESS,
    SAVE_POSITIONS_ERROR
} from "./constants"

export const fetchPositionsSuccess = payload => ({ type: FETCH_POSITIONS_SUCCESS, payload })
export const fetchPositionsError = payload => ({
    type: FETCH_POSITIONS_ERROR,
    error: true,
    payload
})
export const fetchPositions = () => dispatch => {
    return fetch("/api/v1/positions")
        .then(res => res.json())
        .then(data => dispatch(fetchPositionsSuccess(data)))
        .catch(error => dispatch(fetchPositionsError(error)))
}

export const savePositions = payload => ({ type: SAVE_POSITIONS, payload })
export const savePositionsSuccess = payload => ({ type: SAVE_POSITIONS_SUCCESS, payload })
export const savePositionsError = payload => ({ type: SAVE_POSITIONS_ERROR, error: true, payload })
