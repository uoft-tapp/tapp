import { all, fork } from "redux-saga/effects"
import authSaga from "./modules/auth/saga"

export default function* entrySaga() {
    yield all([fork(authSaga)])
}
