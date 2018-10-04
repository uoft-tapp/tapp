import { createReducer } from "redux-create-reducer"
import { UPDATE_POSITION_VALUE } from "./constants"

const initialState = [
    {
        id: "csc209",
        code: "CSC209H1",
        name: "Course Name",
        campus: "St George",
        estimatedEnrol: 100,
        estimatedPositions: 11,
        cap: 88,
        waitlist: 23,
        positionHours: 60,
        startDate: "2018-09-01",
        endDate: "2018-12-01"
    },
    {
        id: "csc148",
        code: "CSC148H1",
        name: "Course Name",
        campus: "St George",
        estimatedEnrol: 100,
        estimatedPositions: 11,
        cap: 88,
        waitlist: 23,
        positionHours: 60,
        startDate: "2018-09-01",
        endDate: "2018-12-01"
    }
]

const reducer = createReducer(initialState, {
    [UPDATE_POSITION_VALUE]: (state, { payload: { positionId, fieldId, value } }) =>
        state.map(
            position => (position.id === positionId ? { ...position, [fieldId]: value } : position)
        )
})

export default reducer
