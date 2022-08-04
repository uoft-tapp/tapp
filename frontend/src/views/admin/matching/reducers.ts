import {
    UPSERT_MATCH,
    BATCH_UPSERT_MATCHES,
    UPSERT_GUARANTEE,
    BATCH_UPSERT_GUARANTEES,
    UPSERT_NOTE,
    BATCH_UPSERT_NOTES,
    SET_SELECTED_POSITION,
    SET_VIEW_TYPE
} from "./constants";
import { createReducer } from "redux-create-reducer";
import { Match, AppointmentGuaranteeStatus, ViewType } from "./types";

export { matchingDataReducer };

export interface MatchingDataState {
    matches: Match[];
    guarantees: AppointmentGuaranteeStatus[];
    notes: Record<string, string | null>;
    selectedPositionId: number | null;
    viewType: ViewType;
}

const initialState: MatchingDataState = {
    matches: [],
    guarantees: [],
    notes: {},
    selectedPositionId: null,
    viewType: "grid"
};

const matchingDataReducer = createReducer(initialState, {
    [UPSERT_MATCH]: (state, action) => {
        // Check if a match with this applicant ID and position ID already exist
        const existingMatch =
            state.matches.find(
                (match) =>
                    match.utorid === action.payload.utorid &&
                    match.positionCode === action.payload.positionCode
            ) || null;

        if (!existingMatch) {
            return { ...state, matches: [...state.matches, action.payload] };
        }

        // Item exists, so we have to update it
        return {
            ...state,
            matches: state.matches.map((match) => {
                if (
                    match.utorid === action.payload.utorid &&
                    match.positionCode === action.payload.positionCode
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
    [UPSERT_GUARANTEE]: (state, action) => {
        // Check if guarantee for a particular applicant already exists
        const existingGuarantee = state.guarantees.find(
            (guarantee) => guarantee.utorid === action.payload.utorid
        );

        if (!existingGuarantee) {
            return {
                ...state,
                guarantees: [...state.guarantees, action.payload],
            };
        }

        // Item exists, update it
        return {
            ...state,
            guarantees: state.guarantees.map((guarantee) => {
                if (guarantee.utorid === action.payload.utorid) {
                    return action.payload;
                } else {
                    return guarantee;
                }
            }),
        };
    },
    [BATCH_UPSERT_GUARANTEES]: (state, action) => {
        return { ...state, guarantees: action.payload };
    },
    [UPSERT_NOTE]: (state, action) => {
        const existingNotes: Record<string, string | null> = { ...state.notes };
        existingNotes[action.payload.utorid] = action.payload.note;

        return { ...state, notes: existingNotes };
    },
    [BATCH_UPSERT_NOTES]: (state, action) => {
        return { ...state, notes: action.payload };
    },
    [SET_SELECTED_POSITION]: (state, action) => {
        return { ...state, selectedPositionId: action.payload };
    },
    [SET_VIEW_TYPE]: (state, action) => {
        return {...state, viewType: action.payload};
    }
});
