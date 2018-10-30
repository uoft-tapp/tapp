import { takeEvery, put, all } from "redux-saga/effects"
import { SAVE_POSITION, DELETE_POSITION, CREATE_NEW_POSITION } from "./constants"
import {
    savePositionsSuccess,
    savePositionsError,
    deletePositionSuccess,
    deletePositionError,
    createNewPositionSuccess,
    createNewPositionError
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

function* handleCreateNewPosition(action) {
    const res = yield fetch(`/api/v1/positions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(action.payload)
    })
    if (res.status === 200) {
        const newPosition = yield res.json()
        yield put(createNewPositionSuccess(newPosition))
    } else {
        yield put(createNewPositionError())
    }
}

export default function*() {
    yield all([
        takeEvery(SAVE_POSITION, handleUpdatePosition),
        takeEvery(DELETE_POSITION, handleDeletePosition),
        takeEvery(CREATE_NEW_POSITION, handleCreateNewPosition)
    ])
}
