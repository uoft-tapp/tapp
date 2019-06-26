import { createReducer } from "redux-create-reducer";
import { FETCH_INSTRUCTORS_SUCCESS } from "./constants";

const initialState = {
    list: []
};

const reducer = createReducer(initialState, {
    [FETCH_INSTRUCTORS_SUCCESS]: (state, action) => ({
        ...state,
        list: action.payload
    })
});

export default reducer;
