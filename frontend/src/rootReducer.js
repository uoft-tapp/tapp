<<<<<<< HEAD
import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import { reducer as notificationReducer } from "react-notification-system-redux";
import authReducer from "./modules/auth/reducer";
import positionReducer from "./modules/positions/reducer";
import applicantReducer from "./modules/applicants_by_course/reducer";
import instructorReducer from "./modules/instructors/reducer";
import applicationReducer from "./modules/application/reducer";
import applicantsPositionReducer from "./modules/applicants_positions/reducer";
=======
import { combineReducers } from "redux"
import { reducer as formReducer } from "redux-form"
import { reducer as notificationReducer } from "react-notification-system-redux"
import authReducer from "./modules/auth/reducer"
import positionReducer from "./modules/positions/reducer"
import applicantReducer from "./modules/applicants_by_course/reducer"
import instructorReducer from "./modules/instructors/reducer"
import applicationReducer from "./modules/application/reducer"
<<<<<<< HEAD
>>>>>>> refactor(frontend) fix routing error, name scope collisions, merge redux store
=======
>>>>>>> cb8e20f819c3c4e9ec4958ca0109b11e597bb6e7

const reducer = combineReducers({
    notifications: notificationReducer,
    form: formReducer,
    auth: authReducer,
    positions: positionReducer,
    applicants: applicantReducer,
    instructors: instructorReducer,
<<<<<<< HEAD
<<<<<<< HEAD
    application: applicationReducer,
    applicantsPositions: applicantsPositionReducer
});
=======
=======
>>>>>>> cb8e20f819c3c4e9ec4958ca0109b11e597bb6e7
    application: applicationReducer
})
>>>>>>> refactor(frontend) fix routing error, name scope collisions, merge redux store

export default reducer;
