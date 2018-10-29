import {
    FETCH_POSITIONS_SUCCESS,
    FETCH_POSITIONS_ERROR,
    SAVE_POSITION,
    SAVE_POSITION_SUCCESS,
    SAVE_POSITION_ERROR,
    OPEN_EDIT_POSITION_MODAL,
    CLOSE_EDIT_POSITION_MODAL
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

export const savePositions = payload => ({ type: SAVE_POSITION, payload })
export const savePositionsSuccess = payload => ({ type: SAVE_POSITION_SUCCESS, payload })
export const savePositionsError = payload => ({ type: SAVE_POSITION_ERROR, error: true, payload })

export const openPositionEditModal = id => ({ type: OPEN_EDIT_POSITION_MODAL, payload: { id } })
export const closeEditPositionModal = () => ({ type: CLOSE_EDIT_POSITION_MODAL })
