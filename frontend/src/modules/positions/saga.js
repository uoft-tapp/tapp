import { takeEvery, put } from "redux-saga/effects"
import { SAVE_POSITIONS } from "./constants"
import { savePositionsSuccess, savePositionsError } from "./actions"

function* handleUpdatePosition(action) {
    if (true) {
        yield put(savePositionsSuccess(action.payload))
    } else {
        yield put(savePositionsError(action.payload))
    }
}

export default function*() {
    yield takeEvery(SAVE_POSITIONS, handleUpdatePosition)
}
