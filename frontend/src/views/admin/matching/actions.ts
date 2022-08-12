import { RootState } from "../../../rootReducer";
import { createSelector } from "reselect";
import { round } from "../../../libs/utils";
import {
    applicationsSelector,
    assignmentsSelector,
    positionsSelector,
    applicantsSelector,
} from "../../../api/actions";
import { Assignment, Application } from "../../../api/defs/types";
import {
    UPSERT_MATCH,
    BATCH_UPSERT_MATCHES,
    UPSERT_GUARANTEE,
    BATCH_UPSERT_GUARANTEES,
    UPSERT_NOTE,
    BATCH_UPSERT_NOTES,
    SET_SELECTED_POSITION,
    SET_VIEW_TYPE,
    SET_UPDATED,
} from "./constants";
import {
    RawMatch,
    PositionSummary,
    ApplicantSummary,
    MatchableAssignment,
    AppointmentGuaranteeStatus,
    ViewType,
    FillStatus,
} from "./types";
import { actionFactory } from "../../../api/actions/utils";

// actions
export const upsertMatch = actionFactory<RawMatch>(UPSERT_MATCH);

export const batchUpsertMatches =
    actionFactory<RawMatch[]>(BATCH_UPSERT_MATCHES);

export const upsertGuarantee =
    actionFactory<AppointmentGuaranteeStatus>(UPSERT_GUARANTEE);

export const batchUpsertGuarantees = actionFactory<
    AppointmentGuaranteeStatus[]
>(BATCH_UPSERT_GUARANTEES);

export const upsertNote =
    actionFactory<Record<string, string | null>>(UPSERT_NOTE);

export const batchUpsertNotes =
    actionFactory<Record<string, string | null>>(BATCH_UPSERT_NOTES);

export const setSelectedPosition = actionFactory<number | null>(
    SET_SELECTED_POSITION
);

export const setViewType = actionFactory<ViewType>(SET_VIEW_TYPE);

export const setUpdated = actionFactory<boolean>(SET_UPDATED);

// selectors
export const matchingDataSelector = (state: RootState) => state.ui.matchingData;
export const guaranteesSelector = (state: RootState) =>
    state.ui.matchingData.guarantees;
export const notesSelector = (state: RootState) => state.ui.matchingData.notes;
export const selectedPositionSelector = (state: RootState) =>
    state.ui.matchingData.selectedPositionId;
export const viewTypeSelector = (state: RootState) =>
    state.ui.matchingData.viewType;
export const updatedSelector = (state: RootState) =>
    state.ui.matchingData.updated;

export const rawMatchesSelector = (state: RootState) =>
    state.ui.matchingData.matches;

// Consolidates the most recent application for each posting for each applicant
export const combinedApplicationsSelector = createSelector(
    [applicantsSelector, applicationsSelector],
    (applicants, applications) => {
        if (applications.length === 0 || applicants.length === 0) {
            return [];
        }

        return applicants
            .map((applicant) => {
                const matchingApplications = applications.filter(
                    (application) => application.applicant.id === applicant.id
                );

                if (matchingApplications.length === 0) {
                    return null;
                }

                // Separate applications by posting
                const applicationsByPosting: Record<number, Application[]> = {};
                for (const application of matchingApplications) {
                    // Handle case where posting is null (pretend id is -1)
                    let postingId = -1;
                    if (application.posting) {
                        postingId = application.posting.id;
                    }
                    applicationsByPosting[postingId] =
                        applicationsByPosting[postingId] || [];
                    applicationsByPosting[postingId].push(application);
                }

                // Sort each bucket:
                let combinedApplication: Application | null = null;
                for (const applications of Object.values(
                    applicationsByPosting
                )) {
                    applications.sort((a, b) => {
                        if (a.submission_date === b.submission_date) {
                            return 0;
                        }
                        if (a.submission_date > b.submission_date) {
                            return 1;
                        }
                        return -1;
                    });

                    const newestApplication =
                        applications[applications.length - 1];
                    if (!combinedApplication) {
                        combinedApplication = newestApplication;
                    } else {
                        // Update values to include info from this application
                        for (const positionPref of newestApplication.position_preferences) {
                            const matchingPref =
                                combinedApplication.position_preferences.find(
                                    (pref) =>
                                        pref.position.position_code ===
                                        positionPref.position.position_code
                                ) || null;

                            if (!matchingPref) {
                                combinedApplication.position_preferences.push(
                                    positionPref
                                );
                            } else {
                                // Update position preference to take the maximum of the two
                                matchingPref.preference_level = Math.max(
                                    positionPref.preference_level,
                                    matchingPref.preference_level
                                );
                            }
                        }
                    }
                }

                return combinedApplication;
            })
            .filter((application) => !!application);
    }
);

/**
 * Create and returns MatchableAssignments from RawMatches.
 */
export const matchesSelector = createSelector(
    [
        rawMatchesSelector,
        positionsSelector,
        applicantsSelector,
        assignmentsSelector,
        combinedApplicationsSelector,
    ],
    (rawMatches, positions, applicants, assignments, applications) => {
        // returns a mapping of matchable assignments to applicant IDs
        let ret: MatchableAssignment[] = [];

        const applicationsByApplicantId: Record<number, Application> = {};
        for (const application of applications) {
            if (application) {
                applicationsByApplicantId[application.applicant.id] =
                    application;
            }
        }

        const assignmentsByApplicantId: Record<number, Assignment[]> = {};
        for (const assignment of assignments) {
            assignmentsByApplicantId[assignment.applicant.id] =
                assignmentsByApplicantId[assignment.applicant.id] || [];
            assignmentsByApplicantId[assignment.applicant.id].push(assignment);
        }

        const rawMatchesByUtorid: Record<string, RawMatch[]> = {};
        for (const rawMatch of rawMatches) {
            rawMatchesByUtorid[rawMatch.utorid] =
                rawMatchesByUtorid[rawMatch.utorid] || [];
            rawMatchesByUtorid[rawMatch.utorid].push(rawMatch);
        }

        // Go over every applicant and determine their matches
        for (const applicant of applicants) {
            const matchesByPositionId: Record<number, MatchableAssignment> = {};

            const combinedApplication = applicationsByApplicantId[applicant.id];
            if (!combinedApplication) {
                continue;
            }

            // Mark positions as being applied for
            for (const positionPreference of combinedApplication.position_preferences) {
                matchesByPositionId[positionPreference.position.id] = {
                    applicant: applicant,
                    position: positionPreference.position,
                    hoursAssigned: 0,
                    status: "applied",
                };
            }

            // Override with RawMatch data if it exists
            for (const rawMatch of rawMatchesByUtorid[applicant.utorid] || []) {
                const targetPosition = positions.find(
                    (position) =>
                        position.position_code === rawMatch.positionCode
                );
                if (targetPosition) {
                    matchesByPositionId[targetPosition.id] = {
                        applicant: applicant,
                        position: targetPosition,
                        hoursAssigned: rawMatch.stagedHoursAssigned || 0,
                        status: getMatchStatusFromRawMatch(rawMatch),
                    };
                }
            }

            // Override with official assignments
            for (const assignment of assignmentsByApplicantId[applicant.id] ||
                []) {
                matchesByPositionId[assignment.position.id] = {
                    applicant: applicant,
                    position: assignment.position,
                    hoursAssigned: assignment.hours || 0,
                    status: "assigned",
                };
            }

            ret = [...ret, ...Object.values(matchesByPositionId)];
        }

        return ret;
    }
);

export const applicantSummariesSelector = createSelector(
    [
        applicantsSelector,
        matchesSelector,
        guaranteesSelector,
        notesSelector,
        combinedApplicationsSelector,
    ],
    (applicants, matches, guarantees, notes, applications) => {
        const ret: ApplicantSummary[] = [];

        for (const applicant of applicants) {
            ret.push({
                applicant: applicant,
                application:
                    applications.find(
                        (application) =>
                            application?.applicant.id === applicant.id
                    ) || null,
                matches: matches.filter(
                    (match) => match.applicant.id === applicant.id
                ),
                guarantee:
                    guarantees.find(
                        (guarantee) => guarantee.utorid === applicant.utorid
                    ) || null,
                note: notes[applicant.utorid] || null,
            });
        }

        return ret;
    }
);

export const positionSummariesByIdSelector = createSelector(
    [positionsSelector, applicantSummariesSelector, matchesSelector],
    (positions, applicantSummaries, matches) => {
        const ret: Record<number, PositionSummary> = [];
        const applicantSummariesByPositionId: Record<
            number,
            ApplicantSummary[]
        > = {};
        for (const applicantSummary of applicantSummaries) {
            for (const match of applicantSummary.matches) {
                if (match.position) {
                    applicantSummariesByPositionId[match.position.id] =
                        applicantSummariesByPositionId[match.position.id] || [];
                    applicantSummariesByPositionId[match.position.id].push(
                        applicantSummary
                    );
                }
            }
        }

        for (const position of positions) {
            const positionMatches = matches.filter(
                (match) => match.position.id === position.id
            );

            const targetHours = round(
                position.hours_per_assignment *
                    (position.desired_num_assignments || 0),
                2
            );

            let hoursAssigned = 0;
            for (const match of positionMatches.filter((match) =>
                ["assigned", "staged-assigned"].includes(match.status)
            )) {
                hoursAssigned += match.hoursAssigned || 0;
            }

            let filledStatus: FillStatus = "empty";
            if (targetHours > 0 && hoursAssigned === 0) {
                filledStatus = "empty";
            } else if (targetHours - hoursAssigned > 0) {
                filledStatus = "under";
            } else if (targetHours - hoursAssigned === 0) {
                filledStatus = "matched";
            } else if (targetHours - hoursAssigned < 0) {
                filledStatus = "over";
            }

            ret[position.id] = {
                position: position,
                hoursAssigned: hoursAssigned,
                filledStatus: filledStatus,
                applicantSummaries:
                    applicantSummariesByPositionId[position.id] || [],
            };
        }

        return ret;
    }
);

/**
 * Returns a RawMatch's MatchStatus based on which flags are set.
 */
function getMatchStatusFromRawMatch(rawMatch: RawMatch) {
    if (rawMatch.stagedAssigned) {
        return "staged-assigned";
    } else if (rawMatch.starred) {
        return "starred";
    } else if (rawMatch.hidden) {
        return "hidden";
    } else {
        return "applied";
    }
}
