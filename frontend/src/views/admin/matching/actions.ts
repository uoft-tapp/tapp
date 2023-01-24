import { RootState } from "../../../rootReducer";
import { createSelector } from "reselect";
import { round } from "../../../libs/utils";
import {
    applicationsSelector,
    assignmentsSelector,
    positionsSelector,
    applicantsSelector,
} from "../../../api/actions";
import { Assignment, Application, Position } from "../../../api/defs/types";
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
} from "./constants";
import {
    RawMatch,
    PositionSummary,
    ApplicantSummary,
    MatchableAssignment,
    AppointmentGuaranteeStatus,
    ApplicantViewMode,
    FillStatus,
    MatchStatus,
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

export const setSelectedMatchingPosition = actionFactory<number | null>(
    SET_SELECTED_MATCHING_POSITION
);

export const setApplicantViewMode = actionFactory<ApplicantViewMode>(
    SET_APPLICANT_VIEW_MODE
);

export const setUpdated = actionFactory<boolean>(SET_UPDATED);

export const toggleStarred = actionFactory<RawMatch>(TOGGLE_STARRED);

// selectors
export const matchingDataSelector = (state: RootState) => state.ui.matchingData;
export const guaranteesSelector = (state: RootState) =>
    state.ui.matchingData.guarantees;
export const notesSelector = (state: RootState) => state.ui.matchingData.notes;
export const selectedMatchingPositionSelector = (state: RootState) =>
    state.ui.matchingData.selectedMatchingPositionId;
export const applicantViewModeSelector = (state: RootState) =>
    state.ui.matchingData.applicantViewMode;
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

        const applicationsByApplicantId: Record<number, Application[]> = {};
        for (const application of applications) {
            applicationsByApplicantId[application.applicant.id] =
                applicationsByApplicantId[application.applicant.id] || [];
            applicationsByApplicantId[application.applicant.id].push(
                application
            );
        }

        return applicants
            .map((applicant) => {
                const matchingApplications =
                    applicationsByApplicantId[applicant.id];

                if (
                    !matchingApplications ||
                    matchingApplications.length === 0
                ) {
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

        const positionsByPositionCode: Record<string, Position> = {};
        for (const position of positions) {
            positionsByPositionCode[position.position_code] = position;
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
                if (positionsByPositionCode[rawMatch.positionCode]) {
                    matchesByPositionId[
                        positionsByPositionCode[rawMatch.positionCode].id
                    ] = {
                        applicant: applicant,
                        position:
                            positionsByPositionCode[rawMatch.positionCode],
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
        const applicationsByApplicantId: Record<number, Application | null> =
            {};
        for (const application of applications) {
            if (application) {
                applicationsByApplicantId[application.applicant.id] =
                    application;
            }
        }

        const matchesByApplicantId: Record<number, MatchableAssignment[]> = {};
        for (const match of matches) {
            matchesByApplicantId[match.applicant.id] =
                matchesByApplicantId[match.applicant.id] || [];
            matchesByApplicantId[match.applicant.id].push(match);
        }

        const guaranteesByUtorid: Record<string, AppointmentGuaranteeStatus> =
            {};
        for (const guarantee of guarantees) {
            guaranteesByUtorid[guarantee.utorid] = guarantee;
        }

        for (const applicant of applicants) {
            let hoursAssigned = 0;
            for (const match of matchesByApplicantId[applicant.id] || []) {
                if (
                    match.status === "assigned" ||
                    match.status === "staged-assigned"
                ) {
                    hoursAssigned += match.hoursAssigned;
                }
            }

            let filledStatus: FillStatus = "n/a";
            if (hoursAssigned > 0) {
                filledStatus = "over";
            }

            if (guaranteesByUtorid[applicant.utorid]) {
                const targetHours =
                    guaranteesByUtorid[applicant.utorid].minHoursOwed;
                if (targetHours > 0 && hoursAssigned === 0) {
                    filledStatus = "empty";
                } else if (targetHours - hoursAssigned > 0) {
                    filledStatus = "under";
                } else if (targetHours - hoursAssigned === 0) {
                    filledStatus = "matched";
                } else if (targetHours - hoursAssigned < 0) {
                    filledStatus = "over";
                }
            }

            ret.push({
                applicant: applicant,
                application: applicationsByApplicantId[applicant.id],
                matches: matchesByApplicantId[applicant.id] || [],
                guarantee: guaranteesByUtorid[applicant.utorid],
                note: notes[applicant.utorid] || null,
                hoursAssigned: hoursAssigned,
                filledStatus: filledStatus,
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

        const matchesByPositionAndStatus: Record<
            number,
            Record<MatchStatus, MatchableAssignment[]>
        > = {};
        for (const match of matches) {
            if (!matchesByPositionAndStatus[match.position.id]) {
                matchesByPositionAndStatus[match.position.id] = {
                    applied: [],
                    assigned: [],
                    "staged-assigned": [],
                    hidden: [],
                    starred: [],
                };
            }

            matchesByPositionAndStatus[match.position.id][match.status].push(
                match
            );
        }

        for (const position of positions) {
            const targetHours = round(
                position.hours_per_assignment *
                    (position.desired_num_assignments || 0),
                2
            );

            // Go over matches marked as assigned/staged-assigned and get the number of hours assigned
            let hoursAssigned = 0;
            const assignedStatuses: MatchStatus[] = [
                "assigned",
                "staged-assigned",
            ];

            if (matchesByPositionAndStatus[position.id]) {
                for (const status of assignedStatuses) {
                    for (const match of matchesByPositionAndStatus[position.id][
                        status
                    ]) {
                        hoursAssigned += match.hoursAssigned || 0;
                    }
                }
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
