import { createReducer } from "redux-create-reducer"
import { UPDATE_POSITION_VALUE_SUCCESS, FETCH_POSITIONS_SUCCESS } from "./constants"

const initialState = []

const reducer = createReducer(initialState, {
    [FETCH_POSITIONS_SUCCESS]: (state, action) => action.payload,
    [UPDATE_POSITION_VALUE_SUCCESS]: (state, { payload: { positionId, fieldId, value } }) =>
        state.map(
            position => (position.id === positionId ? { ...position, [fieldId]: value } : position)
        )
})

export default reducer
