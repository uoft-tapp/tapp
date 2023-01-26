import {
    UPSERT_MATCH,
    BATCH_UPSERT_MATCHES,
    UPSERT_GUARANTEE,
    BATCH_UPSERT_GUARANTEES,
    UPSERT_NOTE,
    BATCH_UPSERT_NOTES,
    SET_SELECTED_MATCHING_POSITION,
    SET_APPLICANT_VIEW_MODE,
    SET_UPDATED,
    TOGGLE_STARRED,
    TOGGLE_ASSIGNED,
} from "./constants";
import { createReducer } from "redux-create-reducer";
import {
    RawMatch,
    AppointmentGuaranteeStatus,
    ApplicantViewMode,
} from "./types";
export { matchingDataReducer };

export interface MatchingDataState {
    matches: RawMatch[];
    guarantees: AppointmentGuaranteeStatus[];
    notes: Record<string, string>;
    selectedMatchingPositionId: number | null;
    applicantViewMode: ApplicantViewMode;
    updated: boolean;
}

const initialState: MatchingDataState = {
    matches: [],
    guarantees: [],
    notes: {},
    selectedMatchingPositionId: null,
    applicantViewMode: "grid",
    updated: false,
};

const matchingDataReducer = createReducer(initialState, {
    [UPSERT_MATCH]: (state, action) => {
        // Check if a match with this applicant ID and position ID already exists
        const existingMatch = state.matches.find(
            (match) =>
                match.utorid === action.payload.utorid &&
                match.positionCode === action.payload.positionCode
        );

        if (!existingMatch) {
            const newMatch: RawMatch = {
                utorid: action.payload.utorid,
                positionCode: action.payload.positionCode,
                stagedHoursAssigned: action.payload.stagedHoursAssigned || 0,
                stagedAssigned: action.payload.stagedAssigned || false,
                starred: action.payload.starred || false,
                hidden: action.payload.hidden || false,
            };

            // If any flag is set to true, add the new RawMatch
            if (
                newMatch.stagedAssigned ||
                newMatch.starred ||
                newMatch.hidden
            ) {
                return {
                    ...state,
                    matches: [...state.matches, action.payload],
                    updated: true,
                };
            }

            return state;
        }

        // Item exists, so we have to update it
        const newMatch: RawMatch = { ...existingMatch, ...action.payload };
        return {
            ...state,
            matches: state.matches
                .map((match) => {
                    if (
                        match.utorid === action.payload.utorid &&
                        match.positionCode === action.payload.positionCode
                    ) {
                        if (
                            newMatch.stagedAssigned ||
                            newMatch.starred ||
                            newMatch.hidden
                        ) {
                            return newMatch;
                        }
                        return null;
                    } else {
                        return match;
                    }
                })
                .filter((match) => !!match),
            updated: true,
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
            updated: true,
        };
    },
    [BATCH_UPSERT_GUARANTEES]: (state, action) => {
        return { ...state, guarantees: action.payload, updated: true };
    },
    [UPSERT_NOTE]: (state, action) => {
        const existingNotes: Record<string, string> = { ...state.notes };

        // If the note is empty, delete it from the record
        if (!action.payload.note) {
            if (existingNotes[action.payload.utorid]) {
                delete existingNotes[action.payload.utorid];
            }
        } else {
            existingNotes[action.payload.utorid] = action.payload.note;
        }

        return { ...state, notes: existingNotes, updated: true };
    },
    [BATCH_UPSERT_NOTES]: (state, action) => {
        return { ...state, notes: action.payload };
    },
    [SET_SELECTED_MATCHING_POSITION]: (state, action) => {
        return { ...state, selectedMatchingPositionId: action.payload };
    },
    [SET_APPLICANT_VIEW_MODE]: (state, action) => {
        return { ...state, applicantViewMode: action.payload };
    },
    [SET_UPDATED]: (state, action) => {
        return { ...state, updated: action.payload };
    },
    [TOGGLE_STARRED]: (state, action) => {
        // Check if a match with this applicant ID and position ID already exists
        const existingMatch = state.matches.find(
            (match) =>
                match.utorid === action.payload.utorid &&
                match.positionCode === action.payload.positionCode
        );

        // If a match doesn't already exist, this applicant is implied to not yet be starred:
        if (!existingMatch) {
            const newMatch: RawMatch = {
                utorid: action.payload.utorid,
                positionCode: action.payload.positionCode,
                starred: true,
            };

            return {
                ...state,
                matches: [...state.matches, newMatch],
                updated: true,
            };
        }

        // Item exists, so we have to update it
        return {
            ...state,
            matches: state.matches
                .map((match) => {
                    if (
                        match.utorid === action.payload.utorid &&
                        match.positionCode === action.payload.positionCode
                    ) {
                        // Check if the match will have any flags set, otherwise mark for deletion:
                        if (
                            match.stagedAssigned ||
                            !match.starred ||
                            match.hidden
                        ) {
                            return { ...match, starred: !match.starred };
                        }
                        return null;
                    } else {
                        return match;
                    }
                })
                .filter((match): match is RawMatch => !!match),
            updated: true,
        };
    },
    [TOGGLE_ASSIGNED]: (state, action) => {
        // Check if a match with this applicant ID and position ID already exists
        const existingMatch = state.matches.find(
            (match) =>
                match.utorid === action.payload.utorid &&
                match.positionCode === action.payload.positionCode
        );

        // If a match doesn't already exist, this applicant is implied to not yet be assigned:
        if (!existingMatch) {
            const newMatch: RawMatch = {
                utorid: action.payload.utorid,
                positionCode: action.payload.positionCode,
                stagedHoursAssigned: action.payload.stagedHoursAssigned || 0,
                stagedAssigned: true,
                starred: false,
                hidden: false,
            };

            return {
                ...state,
                matches: [...state.matches, newMatch],
                updated: true,
            };
        }

        return {
            ...state,
            matches: state.matches
                .map((match) => {
                    if (
                        match.utorid === action.payload.utorid &&
                        match.positionCode === action.payload.positionCode
                    ) {
                        // If the applicant is not assigned, assign them:
                        if (!match.stagedAssigned) {
                            return {
                                ...match,
                                stagedAssigned: true,
                                stagedHoursAssigned:
                                    action.payload.stagedHoursAssigned || 0,
                            };
                        }

                        // Applicant was previously assigned; check if the match will have any flags set, otherwise mark for deletion:
                        if (match.starred || match.hidden) {
                            return {
                                ...match,
                                stagedAssigned: false,
                                stagedHoursAssigned: 0,
                            };
                        }
                        return null;
                    } else {
                        return match;
                    }
                })
                .filter((match): match is RawMatch => !!match),
            updated: true,
        };
    },
});
