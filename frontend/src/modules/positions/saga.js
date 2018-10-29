import { takeEvery, put } from "redux-saga/effects"
import { SAVE_POSITION } from "./constants"
import { savePositionsSuccess, savePositionsError } from "./actions"

function* handleUpdatePosition(action) {
    const res = yield fetch(`/api/v1/positions/${action.payload.positionId}`, {
        method: "PUT",
        body: JSON.stringify(action.payload.newValues)
    })
    if (res.status === 200) {
        yield put(savePositionsSuccess(action.payload))
    } else {
        yield put(savePositionsError(action.payload))
    }
}

export default function*() {
    yield takeEvery(SAVE_POSITION, handleUpdatePosition)
}
