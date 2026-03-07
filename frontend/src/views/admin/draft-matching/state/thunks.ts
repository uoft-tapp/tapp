import { ExportedDraftMatchingAssignmentData } from "../index";
import { createAppAsyncThunk } from "../../../../rootReducer";
import {
    applicantsSelector,
    assignmentsSelector,
    positionsSelector,
} from "../../../../api/actions";
import {
    AssignmentDraft,
    MinimalAssignmentDraft,
    draftMatchingSlice,
} from "./slice";
import { apiError } from "../../../../api/actions/errors";
import { assignmentShouldBeVisible } from "../drag-and-drop-interface/AssignmentRow";

async function waitForMs(timeout: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}

/**
 * Thunk for importing draft matching data that was saved using the export function.
 */
export const importExtraDataThunk = createAppAsyncThunk(
    "draftMatching/importExtraData",
    async (
        fileContents: ExportedDraftMatchingAssignmentData,
        { dispatch, getState }
    ): Promise<void> => {
        try {
            // Wait to make sure no api interactions are currently happening.
            // We do a polling loop, but if things aren't changing in the api interaction list, we give up in 10 seconds.
            let pollingFrequency = 500;
            const MAX_WAIT_WITHOUT_CHANGE = 10000;
            if (getState().model.status.ongoingInteraction) {
                let timeOfLastChange = Date.now();
                let ongoingInteraction =
                    getState().model.status.ongoingInteractionsList;
                let lastOngoingInteractionId =
                    ongoingInteraction[ongoingInteraction.length - 1]?.id;
                await waitForMs(pollingFrequency);
                while (getState().model.status.ongoingInteraction) {
                    if (
                        Date.now() - timeOfLastChange >
                        MAX_WAIT_WITHOUT_CHANGE
                    ) {
                        console.warn(
                            "Waited for 10 seconds without any change in ongoing interactions. Proceeding with import anyway. Ongoing interactions:",
                            getState().model.status.ongoingInteractionsList
                        );
                        break;
                    }
                    const ongoingInteraction =
                        getState().model.status.ongoingInteractionsList;
                    const currentOngoingInteractionId =
                        ongoingInteraction[ongoingInteraction.length - 1]?.id;
                    if (
                        currentOngoingInteractionId !== lastOngoingInteractionId
                    ) {
                        timeOfLastChange = Date.now();
                        lastOngoingInteractionId = currentOngoingInteractionId;
                    }
                    await waitForMs(pollingFrequency);
                }
            }

            // We should be confident all data from the backend is loaded now. Proceed with the import.
            const state = getState();
            const applicants = applicantsSelector(state);
            const utoridToApplicant = Object.fromEntries(
                applicants.map((a) => [a.utorid, a])
            );
            const positions = positionsSelector(state);
            const positionCodeToPosition = Object.fromEntries(
                positions.map((p) => [p.position_code, p])
            );

            // Unconditionally set the show/hide lists and desired hours.
            dispatch(
                draftMatchingSlice.actions.setDesiredHoursByUtorid(
                    fileContents.desiredHoursByUtorid || {}
                )
            );
            dispatch(
                draftMatchingSlice.actions.setShowList(
                    fileContents.showList || []
                )
            );
            dispatch(
                draftMatchingSlice.actions.setHideList(
                    fileContents.hideList || []
                )
            );

            // The draft assignments are trickier, since we need to reconstruct full assignment objects before we dispatch them.
            dispatch(draftMatchingSlice.actions.clearDraftAssignments());
            // Get a list of assignments that are currently on the server. If the assignment already exists, we do not load a draft assignment on top of it.
            const existingAssignments = assignmentsSelector(getState());
            const assignmentsByUtoridAndPositionCode = new Map(
                existingAssignments.map((assignment) => [
                    hashAssignment(assignment),
                    assignment,
                ])
            );
            const actions = assignmentsToActions(fileContents.assignments);
            for (let action of actions) {
                const assignment = action.assignment;
                let existingAssignment = assignmentsByUtoridAndPositionCode.get(
                    hashAssignment(assignment)
                );
                if (
                    existingAssignment &&
                    !assignmentShouldBeVisible(existingAssignment)
                ) {
                    existingAssignment = undefined;
                }
                const applicant = utoridToApplicant[assignment.utorid];
                const position =
                    positionCodeToPosition[assignment.position_code];
                if (!applicant) {
                    throw new Error(
                        `Assignment for utorid ${assignment.utorid} and position code ${assignment.position_code} failed because no applicant with that utorid was found.`
                    );
                }
                if (!position) {
                    throw new Error(
                        `Assignment for utorid ${assignment.utorid} and position code ${assignment.position_code} failed because no position with that position code was found.`
                    );
                }
                const addAssignment = () =>
                    dispatch(
                        draftMatchingSlice.actions.addDraftAssignment({
                            applicant,
                            position,
                            hours: assignment.hours,
                            draft: assignment.draft,
                        } as AssignmentDraft)
                    );
                const deleteAssignment = () =>
                    dispatch(
                        draftMatchingSlice.actions.removeDraftAssignment({
                            applicant,
                            position,
                            // If there is a deleted draft assignment, that means that it shadows an existing real (non-draft) assignment.
                            // We force draft to be false so we will delete the real assignment.
                            draft: false,
                        } as AssignmentDraft)
                    );

                // If there is an existing assignment, but the hours differ, we actually want to do an "update"
                if (
                    action.action === "add" &&
                    existingAssignment &&
                    existingAssignment.hours !== assignment.hours
                ) {
                    action.action = "update";
                }

                switch (action.action) {
                    case "add":
                        // If the assignment, don't add the draft, since we don't want to double up.
                        // If there is an existing assignment with a different number of hours, we should be in the "update" case, not this one.
                        if (!existingAssignment) {
                            addAssignment();
                        } else {
                            console.log(
                                `Not adding draft assignment for utorid ${assignment.utorid} and position code ${assignment.position_code} because an identical assignment already exists on the server.`
                            );
                        }
                        break;
                    case "delete":
                        // Only delete the assignment if one actually exists.
                        if (existingAssignment) {
                            deleteAssignment();
                        } else {
                            console.log(
                                `Not deleting assignment for utorid ${assignment.utorid} and position code ${assignment.position_code} because no such assignment exists on the server.`
                            );
                        }
                        break;
                    case "update":
                        // If an assignment with this number of hours already exists, don't do anything.
                        if (
                            existingAssignment &&
                            existingAssignment.hours === assignment.hours
                        ) {
                            console.log(
                                `Not updating assignment for utorid ${assignment.utorid} and position code ${assignment.position_code} because an identical assignment already exists on the server.`
                            );
                        } else {
                            if (existingAssignment) {
                                // In this case, we have an assignment to update. If it exists on the server, delete it
                                deleteAssignment();
                            }
                            addAssignment();
                        }
                        break;
                    default:
                        const _x: never = action.action;
                        throw new Error(`Unhandled action type: ${_x}`);
                }
            }
        } catch (error) {
            console.error("Failed to import draft matching data:", error);
            dispatch(
                apiError("Failed to import draft matching data: " + error)
            );
        }
    }
);

/**
 * Hash the assignment as `position_code|utorid`.
 */
function hashAssignment(assignment: AssignmentDraft | MinimalAssignmentDraft) {
    if ("position" in assignment && "applicant" in assignment) {
        return `${assignment.position.position_code}|${assignment.applicant.utorid}`;
    }
    return `${assignment.position_code}|${assignment.utorid}`;
}

/**
 * Turn an array of `MinimalAssignmentDraft`s into a list of actions: `add`, `delete`, or `update`.
 */
function assignmentsToActions(assignments: MinimalAssignmentDraft[]): {
    action: "add" | "delete" | "update";
    assignment: MinimalAssignmentDraft;
}[] {
    const assignmentsByHash: Map<string, MinimalAssignmentDraft[]> = new Map();
    for (const assignment of assignments) {
        const hash = hashAssignment(assignment);
        const existingAssignments: MinimalAssignmentDraft[] =
            assignmentsByHash.get(hash) || [];
        existingAssignments.push(assignment);
        assignmentsByHash.set(hash, existingAssignments);
    }
    return Array.from(assignmentsByHash.entries()).map(([_, assignments]) => {
        if (assignments.length === 1) {
            const assignment = assignments[0];
            const action = assignment.deleted ? "delete" : "add";
            return {
                action,
                assignment,
            };
        }

        // In theory there should only every be 2 assignments, one deleted and the other updated.
        // But play it safe and tolerate any input.
        const updatedAssignment = assignments.find((a) => !a.deleted);
        const action = updatedAssignment ? "update" : "delete";
        return {
            action: action,
            assignment: updatedAssignment || assignments[0],
        };
    });
}
