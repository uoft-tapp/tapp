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
    /**
     * Whether or not this assignment can be modified.
     */
    mutable?: boolean;
    /**
     * Whether or not this assignment has been deleted. This allows existing assignments in the database to be deleted in draft mode.
     */
    deleted?: boolean;
    /**
     * If this draft assignment overrides an existing assignment, this field contains the existing assignment that is being shadowed.
     */
    shadows?: Assignment;
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
        /**
         * Remove an assignment from the draft assignments. This has two effects:
         *  - If the assignment is a draft assignment, it is removed from the list of draft assignments.
         *  - If the assignment is not a draft assignment, a new draft assignment is created that marks
         *    the assignment as deleted. This simulates a "deletion" operation while still being a draft.
         */
        removeDraftAssignment(state, action: PayloadAction<AssignmentDraft>) {
            draftMatchingSlice.caseReducers.removeDraftAssignments(state, {
                payload: [action.payload],
            } as PayloadAction<AssignmentDraft[]>);
        },
        /**
         * Remove assignments from the draft assignments. This has two effects:
         *  - If the assignment is a draft assignment, it is removed from the list of draft assignments.
         *  - If the assignment is not a draft assignment, a new draft assignment is created that marks
         *    the assignment as deleted. This simulates a "deletion" operation while still being a draft.
         */
        removeDraftAssignments(
            state,
            action: PayloadAction<AssignmentDraft[]>
        ) {
            const draftAssignmentsByKey = new Map<string, AssignmentDraft>();
            action.payload.forEach((assignment) => {
                draftAssignmentsByKey.set(
                    assignmentKey(assignment),
                    assignment
                );
            });

            state.assignments = state.assignments.filter((assignment) => {
                const toRemove = draftAssignmentsByKey.get(
                    assignmentKey(assignment)
                );
                const shouldKeep = !toRemove || assignment.deleted;
                return shouldKeep;
            });
            // Check for non-draft assignments to mark as deleted
            action.payload.forEach((assignment) => {
                if (!assignment.draft) {
                    state.assignments.push({
                        ...assignment,
                        draft: true,
                        deleted: true,
                    });
                }
            });
        },
        /**
         * Directly remove draft assignments from the state. This assumes all assignments passed in are draft assignments.
         * If a non-draft assignment is passed in it will *not* be marked as deleted.
         */
        forceRemoveDraftAssignments(
            state,
            action: PayloadAction<AssignmentDraft[]>
        ) {
            const toRemoveKeys = new Set(
                action.payload.map((assignment) => assignmentKey(assignment))
            );
            state.assignments = state.assignments.filter((assignment) => {
                const key = assignmentKey(assignment);
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
        // The assignments that exist in the backend. These are unique by key.
        const existingAssignmentsMap = new Map<string, Assignment>(
            assignments.map((assignment) => [
                assignmentKey(assignment),
                {
                    ...assignment,
                    draft: false,
                    mutable: assignment.active_offer_status === null,
                },
            ])
        );
        // Create a merged list of all assignments. Draft assignments override existing assignments.
        // Draft assignments are not unique by key, because they may have been previously "deleted" (i.e., had their deleted state set) and then re-created.
        // Special care is taken to ensure that if a `deleted` and `!deleted` draft exists, the `!deleted` one takes precedence.
        const draftAssignmentsMap: Map<string, AssignmentDraft> = new Map(
            existingAssignmentsMap
        );
        draftMatchingState.assignments.forEach((draftAssignment) => {
            const existingAssignment = existingAssignmentsMap.get(
                assignmentKey(draftAssignment)
            );
            draftAssignmentsMap.set(assignmentKey(draftAssignment), {
                ...draftAssignment,
                draft: true,
                mutable: true,
                shadows: existingAssignment,
            });
        });
        return Array.from(draftAssignmentsMap.values());
    }
);

/**
 * Generate a unique key for an assignment based on position code and applicant utorid.
 */
export function assignmentKey(
    assignment: Pick<AssignmentDraft, "position" | "applicant">
) {
    return `${assignment?.position?.position_code}|${assignment?.applicant?.utorid}`;
}

export const activePositionCodesSelector = createSelector(
    [selfSelector],
    (draftMatchingState) => draftMatchingState.activePositionCodes
);

export const activeApplicantUtoridSelector = createSelector(
    [selfSelector],
    (draftMatchingState) => draftMatchingState.activeApplicantUtorid
);

export const draftAssignmentsByKeySelector = createSelector(
    [draftAssignmentsSelector],
    (assignments) => {
        // Create a map of keys to assignments. Since assignments may not be unique by key (due to deletions and re-creations),
        // non-deleted assignments take precedence.
        const map: Map<string, AssignmentDraft> = new Map();

        assignments.forEach((assignment) => {
            const key = assignmentKey(assignment);
            const currentItem = map.get(key);
            if (!currentItem) {
                map.set(key, assignment);
            } else if (currentItem.deleted && !assignment.deleted) {
                map.set(key, assignment);
            }
        });

        return map;
    }
);
