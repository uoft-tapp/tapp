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
    guarantees: [],
};

const matchingDataReducer = createReducer(initialState, {
    [UPSERT_MATCH]: (state, action) => {
        // Check if a match with this applicant ID and position ID already exist
        const existingMatch =
            state.matches.find(
                (match) =>
                    match.applicantId === action.payload.applicantId &&
                    match.positionId === action.payload.positionId
            ) || null;

        if (!existingMatch) {
            return { ...state, matches: [...state.matches, action.payload] };
        }

        // Item exists, so we have to update it
        return {
            ...state,
            matches: state.matches.map((match) => {
                if (
                    match.applicantId === action.payload.applicantId &&
                    match.positionId === action.payload.positionId
                ) {
                    return action.payload;
                } else {
                    return match;
                }
            }),
        };
    },
    [BATCH_UPSERT_MATCHES]: (state, action) => {
        return { ...state, matches: action.payload };
    },
});

export default matchingDataReducer;
