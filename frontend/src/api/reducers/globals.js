import { createReducer } from "redux-create-reducer";
import { SET_GLOBALS } from "../constants";

export const globalReducer = createReducer(
    {},
    {
        [SET_GLOBALS]: (state, action) => ({
            ...state,
            ...action.payload
        })
    }
);
