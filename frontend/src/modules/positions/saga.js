import { takeEvery, put } from "redux-saga/effects"
import { UPDATE_POSITION_VALUE_REQUEST } from "./constants"
import { updatePositionValueSuccess, updatePositionValueError } from "./actions"

function* handleUpdatePosition(action) {
    if (true) {
        yield put(updatePositionValueSuccess(action.payload))
    } else {
        yield put(updatePositionValueError(action.payload))
    }
}

export default function*() {
    yield takeEvery(UPDATE_POSITION_VALUE_REQUEST, handleUpdatePosition)
}
