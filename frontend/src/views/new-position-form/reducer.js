import { createReducer } from "redux-create-reducer";
import { CREATE_NEW_POSITION_SUCCESS, IMPORT_NEW_POSITION_SUCCESS } from "../../api/constants";

const initialState = {
    list: []
};

const reducer = createReducer(initialState, {
    [CREATE_NEW_POSITION_SUCCESS]: (state, action) => ({
        ...state,
        list: [...state.list, action.payload],
    }),
    [IMPORT_NEW_POSITION_SUCCESS]: (state) => ({
        ...state,
        num_successes: state.num_successes + 1
    })
});

export default reducer;
