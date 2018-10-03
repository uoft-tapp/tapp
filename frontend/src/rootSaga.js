import { delay } from "redux-saga"
import { takeLatest, call } from "redux-saga/effects"

function* customLogger(action) {
    yield call(delay, 1000)
    console.log("Action Type:", action.type)
}

export default function* entrySaga() {
    yield takeLatest("*", customLogger)
}
