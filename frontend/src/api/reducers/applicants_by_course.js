import { createReducer } from "redux-create-reducer";
import {
    SELECT_APPLICANT_SUCCESS,
    REMOVE_APPLICANT_SUCCESS,
    CHANGE_INSTRUCTOR_PREF_SUCCESS,
    VIEW_POSITION,
    SWITCH_POSITIONS
} from "../constants";

// TODO: Move these to mockAPI
const data1 = [
    {
        positionId: 1,
        applicantId: 1,
        last_name: "Paul",
        first_name: "Steve",
        department: "dept",
        program: "prog",
        year: "3",
        instructor_pref: 1,
        other: [],
        locked: true
    }
];

const data2 = [
    {
        positionId: 1,
        applicantId: 2,
        last_name: "Paul",
        first_name: "Harvey",
        department: "dept",
        program: "Undergrad",
        year: "3",
        instructor_pref: 1,
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
        instructor_pref: 2,
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
        instructor_pref: -1,
        other: []
    }
];

const initialState = {
    selectedPositionIds: [],
    positionData: []
};

export const applicantsByCourseReducer = createReducer(initialState, {
    [SELECT_APPLICANT_SUCCESS]: (
        state,
        { payload: { positionId, applicantId } }
    ) => {
        const { selected, available } = state.positionData[positionId];
        const applicant = available.find(
            item => item.applicantId === applicantId
        );
        return {
            ...state,
            positionData: {
                [positionId]: {
                    selected: [...selected, applicant],
                    available: available.filter(
                        item => item.applicantId !== applicantId
                    )
                }
            }
        };
    },
    [REMOVE_APPLICANT_SUCCESS]: (
        state,
        { payload: { applicantId, positionId } }
    ) => {
        const { selected, available } = state.positionData[positionId];
        const applicant = selected.find(
            item => item.applicantId === applicantId
        );
        return {
            ...state,
            positionData: {
                [positionId]: {
                    selected: selected.filter(
                        item => item.applicantId !== applicantId
                    ),
                    available: [...available, applicant]
                }
            }
        };
    },
    [CHANGE_INSTRUCTOR_PREF_SUCCESS]: (
        state,
        { payload: { applicantId, positionId, instructorPref } }
    ) => {
        const { available, selected } = state.positionData[positionId];

        const newAvailale = [];

        available.forEach(item => {
            if (item.applicantId === applicantId) {
                const newItem = {};
                Object.keys(item).forEach(field => {
                    if (field === "instructor_pref") {
                        newItem[field] = instructorPref;
                    } else {
                        newItem[field] = item[field];
                    }
                });
                newAvailale.push(newItem);
            } else {
                newAvailale.push(item);
            }
        });

        return {
            ...state,
            positionData: {
                [positionId]: {
                    selected: selected,
                    available: newAvailale
                }
            }
        };
    },
    [VIEW_POSITION]: (state, action) => {
        if (state.selectedPositionIds.indexOf(action.payload) !== -1) {
            return {
                ...state,
                selectedPositionIds: state.selectedPositionIds.filter(
                    item => item !== action.payload
                )
            };
        }
        switch (state.selectedPositionIds.length) {
            case 0:
                return { ...state, selectedPositionIds: [action.payload] };
            case 1:
            case 2:
                return {
                    ...state,
                    selectedPositionIds: [action.payload, state.selectedPositionIds[0]]
                };
            default:
                return state;
        }
    },
    [SWITCH_POSITIONS]: state => {
        if (state.selectedPositionIds.length === 2) {
            return {
                ...state,
                selectedPositionIds: [state.selectedPositionIds[1], state.selectedPositionIds[0]]
            };
        }
        return state;
    }
});
