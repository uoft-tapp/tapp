import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import { reducer as notificationReducer } from "react-notification-system-redux";
import authReducer from "./modules/auth/reducer";
import positionReducer from "./modules/positions/reducer";
import applicantReducer from "./modules/applicants_by_course/reducer";
import instructorReducer from "./modules/instructors/reducer";
import applicationReducer from "./modules/application/reducer";
import applicantsPositionReducer from "./modules/applicants_positions/reducer";
import { sessionsReducer, positionsReducer } from "./api/reducers";

// When `combineReducers` is used,
// every action gets dispatched to every reducer.
// Since reducers don't change the state on unrecognized
// actions, this is okay. Further, each reducer believes
// it has its own top-level state, but in reality it is
// just passed a part of the whole state. E.g., if `combineReducers`
// is passed
//   {
//      mypath: myReducer
//   }
// When `myReducer(localState)` is called, `localSate == globalState.mypath`.
const reducer = combineReducers({
    model: combineReducers({
        sessions: sessionsReducer,
        positions: positionsReducer
    }),
    ui: combineReducers({
        notifications: notificationReducer,
        form: formReducer,
        auth: authReducer,
        positions: positionReducer,
        applicants: applicantReducer,
        instructors: instructorReducer,
        application: applicationReducer,
        applicantsPositions: applicantsPositionReducer
    })
});

export default reducer;
