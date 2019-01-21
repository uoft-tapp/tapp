import { takeEvery, put, all } from "redux-saga/effects"
import { SAVE_POSITION, DELETE_POSITION } from "./constants"
import {
    savePositionsSuccess,
    savePositionsError,
    deletePositionSuccess,
    deletePositionError
} from "./actions"

function* handleUpdatePosition(action) {
    const res = yield fetch(`/api/v1/positions/${action.payload.positionId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(action.payload.newValues)
    })
    if (res.status === 200) {
        yield put(savePositionsSuccess(action.payload))
    } else {
        yield put(savePositionsError(action.payload))
    }
}

function* handleDeletePosition(action) {
    const res = yield fetch(`/api/v1/positions/${action.payload.positionId}`, {
        method: "DELETE"
    })
    if (res.status === 200) {
        yield put(deletePositionSuccess(action.payload))
    } else {
        yield put(deletePositionError(action.payload))
    }
}

export default function*() {
    yield all([
        takeEvery(SAVE_POSITION, handleUpdatePosition),
        takeEvery(DELETE_POSITION, handleDeletePosition)
    ])
}
