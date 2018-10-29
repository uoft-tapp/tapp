import { createReducer } from "redux-create-reducer"
import {
    FETCH_POSITIONS_SUCCESS,
    SAVE_POSITION_SUCCESS,
    OPEN_EDIT_POSITION_MODAL,
    CLOSE_EDIT_POSITION_MODAL
} from "./constants"

const initialState = {
    editPosition: null,
    list: []
}

const reducer = createReducer(initialState, {
    [FETCH_POSITIONS_SUCCESS]: (state, action) => ({ ...state, list: action.payload }),
    [SAVE_POSITION_SUCCESS]: (state, action) => ({
        ...state,
        list: state.list.map(
            position =>
                position.id === action.payload.positionId
                    ? {
                          ...position,
                          ...action.payload.newValues
                      }
                    : position
        )
    }),
    [OPEN_EDIT_POSITION_MODAL]: (state, action) => ({
        ...state,
        editPosition: action.payload.id
    }),
    [CLOSE_EDIT_POSITION_MODAL]: state => ({ ...state, editPosition: null })
})

export default reducer
