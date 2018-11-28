import { createReducer } from "redux-create-reducer"
import {
    SELECT_APPLICANT_SUCCESS,
    REMOVE_APPLICANT_SUCCESS,
    VIEW_POSITION,
    SWITCH_POSITIONS
} from "./constants"

const data1 = [
    {
        positionId: 1,
        applicantId: 1,
        last_name: "Paul",
        first_name: "Steve",
        department: "dept",
        program: "prog",
        year: "3",
        other: [],
        locked: true
    }
]

const data2 = [
    {
        positionId: 1,
        applicantId: 2,
        last_name: "Paul",
        first_name: "Harvey",
        department: "dept",
        program: "Undergrad",
        year: "3",
        other: []
    },
    {
        positionId: 1,
        applicantId: 3,
        last_name: "Smith",
        first_name: "Harold",
        department: "dept",
        program: "Graduate",
        year: "3",
        other: []
    },
    {
        positionId: 1,
        applicantId: 4,
        last_name: "Jones",
        first_name: "Harvey",
        department: "dept",
        program: "PostDoc",
        year: "3",
        other: []
    },
    {
        positionId: 1,
        applicantId: 5,
        last_name: "McDonald",
        first_name: "Adam",
        department: "dept",
        program: "Graduate",
        year: "3",
        other: ["CSC108"]
    },
    {
        positionId: 1,
        applicantId: 6,
        last_name: "Mulligan",
        first_name: "Anthony",
        department: "dept",
        program: "PostDoc",
        year: "3",
        other: []
    }
]

const initialState = {
    openPositions: [],
    positionData: {
        1: {
            selected: data1,
            available: data2
        },
        2: {
            selected: data1,
            available: data2
        },
        3: {
            selected: data1,
            available: data2
        },
        4: {
            selected: data1,
            available: data2
        }
    }
}

const reducer = createReducer(initialState, {
    [SELECT_APPLICANT_SUCCESS]: (state, { payload: { positionId, applicantId } }) => {
        const { selected, available } = state.positionData[positionId]
        const applicant = available.find(item => item.applicantId === applicantId)
        return {
            ...state,
            positionData: {
                [positionId]: {
                    selected: [...selected, applicant],
                    available: available.filter(item => item.applicantId !== applicantId)
                }
            }
        }
    },
    [REMOVE_APPLICANT_SUCCESS]: (state, { payload: { applicantId, positionId } }) => {
        const { selected, available } = state.positionData[positionId]
        const applicant = selected.find(item => item.applicantId === applicantId)
        return {
            ...state,
            positionData: {
                [positionId]: {
                    selected: selected.filter(item => item.applicantId !== applicantId),
                    available: [...available, applicant]
                }
            }
        }
    },
    [VIEW_POSITION]: (state, action) => {
        if (state.openPositions.indexOf(action.payload) !== -1) {
            return {
                ...state,
                openPositions: state.openPositions.filter(item => item !== action.payload)
            }
        }
        switch (state.openPositions.length) {
            case 0:
                return { ...state, openPositions: [action.payload] }
            case 1:
            case 2:
                return { ...state, openPositions: [action.payload, state.openPositions[0]] }
            default:
                return state
        }
    },
    [SWITCH_POSITIONS]: (state, action) => {
        if (state.openPositions.length === 2) {
            return { ...state, openPositions: [state.openPositions[1], state.openPositions[0]] }
        }
        return state
    }
})

export default reducer
