import { createReducer } from "redux-create-reducer";
import { CREATE_NEW_POSITION_SUCCESS } from "./constants";

const reducer = createReducer(initialState, {
    [CREATE_NEW_POSITION_SUCCESS]: (state, action) => ({
        ...state,
        list: [...state.list, action.payload]
    })
});

export default reducer;
