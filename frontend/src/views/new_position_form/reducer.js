import { createReducer } from "redux-create-reducer";
import { UPSERT_ONE_SESSION_SUCCESS } from "../../api/constants/index";

const initialState = {
    newPositionInfo: []
};

const reducer = createReducer(initialState, {
    [UPSERT_ONE_SESSION_SUCCESS]: (state, action) => ({
        ...state,
        newPositionInfo: [...state.newPositionInfo, action.payload]
    })
});

export default reducer;
