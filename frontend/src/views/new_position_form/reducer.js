import { createReducer } from "redux-create-reducer";
import {
    UPSERT_POSITIONS_SUCCESS,
    UPSERT_ONE_POSITION_SUCCESS
} from "../../api/constants/index";

const initialState = {
    newPositionData: [],
    previousSubmitSuccess: false
};

const reducer = createReducer(initialState, {
    [UPSERT_POSITIONS_SUCCESS]: (state, action) => ({
        ...state,
        newPositionData: [...state.newPositionData, ...action.payload]
    }),
    [UPSERT_ONE_POSITION_SUCCESS]: (state, action) => ({
        ...state,
        newPositionData: [...state.newPositionData, action.payload],
        previousSubmitSuccess: true
    })
});

export default reducer;
