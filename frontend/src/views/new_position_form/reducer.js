import { createReducer } from "redux-create-reducer";
import {
    CREATE_NEW_POSITION_FAILURE,
    CREATE_NEW_POSITION_SUCCESS,
    IMPORT_NEW_POSITION_FAILURE,
    IMPORT_NEW_POSITION_SUCCESS
} from "../../api/constants/new_position";

const initialState = {
    new_position_created: false,
    new_position_info: [],
    num_failures: 0,
    num_successes: 0
};

const reducer = createReducer(initialState, {
    [CREATE_NEW_POSITION_FAILURE]: state => ({
        ...state,
        new_position_created: false
    }),
    [CREATE_NEW_POSITION_SUCCESS]: (state, action) => ({
        ...state,
        new_position_info: [...state.new_position_info, action.payload],
        new_position_created: true
    }),
    [IMPORT_NEW_POSITION_FAILURE]: state => ({
        ...state,
        num_failures: state.num_failures + 1
    }),
    [IMPORT_NEW_POSITION_SUCCESS]: (state, action) => ({
        ...state,
        new_position_info: [...state.new_position_info, action.payload],
        num_successes: state.num_successes + 1
    })
});

export default reducer;
