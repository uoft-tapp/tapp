import { combineReducers } from "redux"
import authReducer from "./modules/auth/reducer"

const reducer = combineReducers({
    auth: authReducer
})

export default reducer
