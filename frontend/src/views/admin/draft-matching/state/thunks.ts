import { ExportedDraftMatchingAssignmentData } from "../index";
import { createAppAsyncThunk } from "../../../../rootReducer";
import { applicantsSelector, positionsSelector } from "../../../../api/actions";
import { AssignmentDraft, draftMatchingSlice } from "./slice";
import { apiError } from "../../../../api/actions/errors";

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
            for (const assignment of fileContents.assignments) {
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
                if (assignment.deleted) {
                    console.log("Deleting assignment", assignment);
                    dispatch(
                        draftMatchingSlice.actions.removeDraftAssignment({
                            applicant,
                            position,
                            // If there is a deleted draft assignment, that means that it shadows an existing real (non-draft) assignment.
                            // We force draft to be false so we will delete the real assignment.
                            draft: false,
                        } as AssignmentDraft)
                    );
                } else {
                    dispatch(
                        draftMatchingSlice.actions.addDraftAssignment({
                            applicant,
                            position,
                            draft: assignment.draft,
                            hours: assignment.hours,
                        } as AssignmentDraft)
                    );
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
