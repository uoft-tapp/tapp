import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../rootReducer";
import { Assignment, Position } from "../../../../api/defs/types";
import { assignmentsSelector } from "../../../../api/actions";

export interface PositionDraft extends Position {
    /**
     * Whether or not any of the fields of this position have been overridden.
     */
    draft: boolean;
}

export interface AssignmentDraft extends Omit<Assignment, "id"> {
    id?: Assignment["id"];
    /**
     * Whether or not any of the fields of this assignment have been overridden.
     */
    draft?: boolean;
}

export interface DraftMatchingState {
    /**
     * List of utorids of applicants to hide.
     */
    hideList: string[];
    /**
     * List of utorids of applicants to show.
     */
    showList: string[];
    /**
     * The draft assignments created by the interface. These are not saved to the backend, but may shadow some assignments that exist in the backend (and are withdrawn/rejected).
     */
    assignments: AssignmentDraft[];
    /**
     * When the position buttons are clicked, they become "active" and candidates interested in those positions are highlighted.
     * This field contains a list of all the active position codes.
     */
    activePositionCodes: string[];
    /**
     * When an applicant is being dragged, their preferences are highlighted. This field contains the utorid of the active applicant.
     */
    activeApplicantUtorid: string | null;
}

const initialState: DraftMatchingState = {
    hideList: [],
    showList: [],
    assignments: [],
    activePositionCodes: [],
    activeApplicantUtorid: null,
};

export const draftMatchingSlice = createSlice({
    name: "draftMatching",
    initialState,
    reducers: {
        setHideList(state, action: PayloadAction<string[]>) {
            state.hideList = action.payload;
        },
        setShowList(state, action: PayloadAction<string[]>) {
            state.showList = action.payload;
        },
        addDraftAssignment(state, action: PayloadAction<AssignmentDraft>) {
            state.assignments.push(action.payload);
        },
        removeDraftAssignment(state, action: PayloadAction<AssignmentDraft>) {
            state.assignments = state.assignments.filter((assignment) => {
                return !(
                    assignment.position.position_code ===
                        action.payload.position.position_code &&
                    assignment.applicant.utorid ===
                        action.payload.applicant.utorid
                );
            });
        },
        removeDraftAssignments(
            state,
            action: PayloadAction<AssignmentDraft[]>
        ) {
            const toRemoveKeys = new Set(
                action.payload.map(
                    (assignment) =>
                        `${assignment.position.position_code}|${assignment.applicant.utorid}`
                )
            );
            state.assignments = state.assignments.filter((assignment) => {
                const key = `${assignment.position.position_code}|${assignment.applicant.utorid}`;
                return !toRemoveKeys.has(key);
            });
        },
        clearDraftAssignments(state) {
            state.assignments = [];
        },
        addActivePositionCode(state, action: PayloadAction<string>) {
            if (!state.activePositionCodes.includes(action.payload)) {
                state.activePositionCodes.push(action.payload);
            }
        },
        removeActivePositionCode(state, action: PayloadAction<string>) {
            state.activePositionCodes = state.activePositionCodes.filter(
                (code) => code !== action.payload
            );
        },
        setActiveApplicantUtorid(state, action: PayloadAction<string | null>) {
            state.activeApplicantUtorid = action.payload;
        },
    },
});

export const draftMatchingReducer = draftMatchingSlice.reducer;

export const selfSelector = (state: RootState) => state.ui.draftMatching;

export const draftAssignmentsSelector = createSelector(
    [assignmentsSelector, selfSelector],
    (assignments, draftMatchingState) => {
        // Merge all draft assignments with the real assignments.
        // If there is a draft assignment and an existing real assignment to the same position, the `active_offer*` fields are all set to null.
        const draftAssignmentsMap: Map<string, AssignmentDraft> = new Map();
        assignments.forEach((assignment) => {
            draftAssignmentsMap.set(assignmentKey(assignment), {
                ...assignment,
                draft: false,
            });
        });
        draftMatchingState.assignments.forEach((draftAssignment) => {
            draftAssignmentsMap.set(assignmentKey(draftAssignment), {
                ...draftAssignment,
                draft: true,
            });
        });
        return Array.from(draftAssignmentsMap.values());
    }
);

/**
 * Generate a unique key for an assignment based on position code and applicant utorid.
 */

function assignmentKey(assignment: AssignmentDraft) {
    return `${assignment.position.position_code}|${assignment.applicant.utorid}`;
}

export const activePositionCodesSelector = createSelector(
    [selfSelector],
    (draftMatchingState) => draftMatchingState.activePositionCodes
);

export const activeApplicantUtoridSelector = createSelector(
    [selfSelector],
    (draftMatchingState) => draftMatchingState.activeApplicantUtorid
);
