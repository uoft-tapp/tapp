import { all, fork } from "redux-saga/effects"
import authSaga from "./modules/auth/saga"
import privateSaga from "./modules/private/saga"

export default function* entrySaga() {
    yield all([fork(authSaga), fork(privateSaga)])
}
