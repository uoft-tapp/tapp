import { createReducer } from "redux-create-reducer";
import {
    CREATE_NEW_POSITION_SUCCESS,
    IMPORT_NEW_POSITION_FAILURE,
    IMPORT_NEW_POSITION_SUCCESS } from "../../api/constants";

const initialState = {
    list: []
};

const reducer = createReducer(initialState, {
    [CREATE_NEW_POSITION_SUCCESS]: (state, action) => ({
        ...state,
        list: [...state.list, action.payload],
    }),
    [IMPORT_NEW_POSITION_FAILURE]: (state) => (
        Object.assign({}, state, {
            num_failures: state.num_failures + 1
        })
    ),
    [IMPORT_NEW_POSITION_SUCCESS]: (state) => (
        Object.assign({}, state, {
            num_successes: state.num_successes + 1
        })
    )
});

export default reducer;