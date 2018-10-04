import { combineReducers } from "redux"
import authReducer from "./modules/auth/reducer"
import positionReducer from "./modules/positions/reducer"

const reducer = combineReducers({
    auth: authReducer,
    positions: positionReducer
})

export default reducer
