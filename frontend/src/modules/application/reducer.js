import { initialFields } from "./components/FormFields"
import { UPDATE_FIELD } from "./constants"

import { createReducer } from "redux-create-reducer"

// initialize the states of the application form
const initialState = {
    fields: initialFields
}

// reducer function that takes an action and returns a new state along with the previous states
const reducer = createReducer(initialState, {
    [UPDATE_FIELD]: (state, action) => { 
        var new_fields = {}
        for (var key in state.fields) {
            if (key === action.data["key"]) {
                new_fields[key] = action.data["value"]
            } else {
                new_fields[key] = state.fields[key]
            }
        }
        return {...state, fields: new_fields}
    }
})

// must import this reducer in the rootReducer file for the state tree to be created
export default reducer
