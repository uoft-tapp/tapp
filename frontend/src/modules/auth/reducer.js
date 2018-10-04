import { createReducer } from "redux-create-reducer"
import { LOGOUT, LOGIN_SUCCESS, LOGIN_REQUEST } from "./constants"

const initialState = {
    isLoggedIn: false,
    loading: false
}

const reducer = createReducer(initialState, {
    [LOGIN_REQUEST]: state => ({ ...state, loading: true }),
    [LOGIN_SUCCESS]: state => ({ ...state, isLoggedIn: true, loading: false }),
    [LOGOUT]: state => ({ ...state, isLoggedIn: false, loading: false })
})

export default reducer
