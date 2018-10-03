import { takeEvery } from "redux-saga/effects"
import { SUBMIT_FORM } from "./constants"

function* handleForm(action) {
    // Doesn't need to be yielded but a generator should always yield something
    yield alert(`Thank you for submitting the form ${action.payload.name}`)
}

export default function*() {
    yield takeEvery(SUBMIT_FORM, handleForm)
}
