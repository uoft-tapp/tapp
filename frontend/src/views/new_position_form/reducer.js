import { createReducer } from "redux-create-reducer";
import { UPSERT_ONE_POSITION_SUCCESS } from "../../api/constants/index";

const initialState = {
    newPositionData: [],
    previousSubmitSuccess: false
};

const reducer = createReducer(initialState, {
    [UPSERT_ONE_POSITION_SUCCESS]: (state, action) => ({
        ...state,
        newPositionData: [...state.newPositionData, action.payload],
        previousSubmitSuccess: true
    })
});

export default reducer;
