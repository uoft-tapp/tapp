import { UPSERT_MATCH, BATCH_UPSERT_MATCHES } from "./constants";
import { createReducer } from "redux-create-reducer";
import { Match, AppointmentGuaranteeStatus } from "./types";

interface MatchingDataState {
    matches: Match[];
    guarantees: AppointmentGuaranteeStatus[];
}

// initialize the state of offer table
const initialState: MatchingDataState = {
    matches: [],
    guarantees: []
};

const matchingDataReducer = createReducer(initialState, {
    [UPSERT_MATCH]: (state, action) => {
        // If a match with this applicant ID and position ID already exists, update it:
        if (state.matches.find(
            (match) => 
                match.applicantId === (action.payload).applicantId && match.positionId === (action.payload).positionId)
        ) {
            return { ...state, matches: [
                    state.matches.map((match) => {
                        if (match.applicantId === (action.payload).applicantId && match.positionId === (action.payload).positionId) {
                            return action.payload;
                        }
                        return match;
                    })
                ]
            }
        }

        // Otherwise, just append to the list
        return { ...state, 
            matches: [
                ...state.matches,
                action.payload
            ]
        }
    },
    [BATCH_UPSERT_MATCHES]: (state, action) => {
        return {...state, matches: action.payload};
    }
});

export default matchingDataReducer;
