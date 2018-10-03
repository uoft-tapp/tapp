import { LOGIN, LOGOUT } from "./constants"

const initialState = {
    isLoggedIn: false
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN:
            return { ...state, isLoggedIn: true }
        case LOGOUT:
            return { ...state, isLoggedIn: false }
        default:
            return state
    }
}

export default reducer
