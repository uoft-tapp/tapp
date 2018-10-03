import { LOGOUT, LOGIN_SUCCESS, LOGIN_REQUEST } from "./constants"

const initialState = {
    isLoggedIn: false,
    loading: false
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_REQUEST:
            return { ...state, loading: true }
        case LOGIN_SUCCESS:
            return { ...state, isLoggedIn: true, loading: false }
        case LOGOUT:
            return { ...state, isLoggedIn: false, loading: false }
        default:
            return state
    }
}

export default reducer
