import { combineReducers } from "redux"
import { reducer as formReducer } from "redux-form"
import { reducer as notificationReducer } from "react-notification-system-redux"
import authReducer from "./modules/auth/reducer"
import positionReducer from "./modules/positions/reducer"
import applicantReducer from "./modules/applicants/reducer"

const reducer = combineReducers({
    notifications: notificationReducer,
    form: formReducer,
    auth: authReducer,
    positions: positionReducer,
    applicants: applicantReducer
})

export default reducer
