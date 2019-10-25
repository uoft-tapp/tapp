import { reducer as formReducer } from "redux-form";
import { reducer as notificationReducer } from "react-notification-system-redux";
import { combineReducers } from "./api/reducers/utils";
import applicationReducer from "./views/application_form/reducer";
import newPositionReducer from "./views/new_position_form/reducer";
import offerTableReducer from "./views/offertable/reducers";
import { globalReducer } from "./views/globals/reducers";
import {
    statusReducer,
    sessionsReducer,
    positionsReducer,
    applicantsReducer,
    applicantsByCouseReducer,
    applicationsReducer,
    assignmentsReducer,
    instructorsReducer,
    positionTemplatesReducer
} from "./api/reducers";

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
        status: statusReducer,
        sessions: sessionsReducer,
        positions: positionsReducer,
        applicants: applicantsReducer,
        applicantsByCouse: applicantsByCouseReducer,
        applications: applicationsReducer,
        assignments: assignmentsReducer,
        instructors: instructorsReducer,
        positionTemplates: positionTemplatesReducer
    }),
    ui: combineReducers({
        notifications: notificationReducer,
        form: formReducer,
        application: applicationReducer,
        newPosition: newPositionReducer,
        offerTable: offerTableReducer,
        globals: globalReducer
    })
});

export default reducer;
