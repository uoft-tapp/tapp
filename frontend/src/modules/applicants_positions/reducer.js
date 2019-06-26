import { createReducer } from "redux-create-reducer";
import {
    OPEN_EDIT_POSITION_MODAL,
    CLOSE_EDIT_POSITION_MODAL,
    FETCH_POSITIONS_SUCCESS
} from "./constants";

const initialState = {
    list: []
};

const reducer = createReducer(initialState, {
    [FETCH_POSITIONS_SUCCESS]: (state, action) => ({
        ...state,
        list: action.payload
    }),
    [OPEN_EDIT_POSITION_MODAL]: (state, action) => ({
        ...state,
        editPosition: action.payload.id
    }),
    [CLOSE_EDIT_POSITION_MODAL]: state => ({ ...state, editPosition: null })
});

export default reducer;
