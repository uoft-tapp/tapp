import { all, fork } from "redux-saga/effects"
import authSaga from "./modules/auth/saga"
import positionSaga from "./modules/positions/saga"

export default function* entrySaga() {
    yield all([fork(authSaga), fork(positionSaga)])
}
