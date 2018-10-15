import { delay } from "redux-saga"
import { takeEvery, call, put } from "redux-saga/effects"
import { LOGIN_REQUEST } from "./constants"
import { loginSuccess } from "./actions"

function* loginHandler(action) {
    yield call(delay, 1000)
    yield put(loginSuccess())
}

export default function*() {
    yield takeEvery(LOGIN_REQUEST, loginHandler)
}
