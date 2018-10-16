import { combineReducers } from "redux"
import { reducer as formReducer } from "redux-form"
import authReducer from "./modules/auth/reducer"
import positionReducer from "./modules/positions/reducer"

const reducer = combineReducers({
    form: formReducer,
    auth: authReducer,
    positions: positionReducer
})

export default reducer
