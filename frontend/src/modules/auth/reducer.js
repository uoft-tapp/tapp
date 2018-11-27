import { createReducer } from "redux-create-reducer"
import { LOGOUT, LOGIN_SUCCESS } from "./constants"

const initialState = {
    isLoggedIn: false
}

const reducer = createReducer(initialState, {
    [LOGIN_SUCCESS]: state => ({ ...state, isLoggedIn: true }),
    [LOGOUT]: state => ({ ...state, isLoggedIn: false })
})

export default reducer
