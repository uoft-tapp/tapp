import { createReducer } from "redux-create-reducer"
import { FETCH_POSITIONS_SUCCESS, SAVE_POSITIONS_SUCCESS } from "./constants"

const initialState = []

const reducer = createReducer(initialState, {
    [FETCH_POSITIONS_SUCCESS]: (state, action) => action.payload,
    [SAVE_POSITIONS_SUCCESS]: (state, action) =>
        state.map(position => ({
            ...position,
            ...action.payload.positions[position.id],
            round: {
                ...position.round,
                ...action.payload.positions[position.id].round
            }
        }))
})

export default reducer
