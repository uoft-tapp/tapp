import React from "react";

import { ContentArea } from "../../../components/layout";
import { useSelector } from "react-redux";
import { activeSessionSelector, fetchPostings } from "../../../api/actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { round } from "../../../libs/utils";

import {
    applicationsSelector,
    assignmentsSelector,
    positionsSelector,
    applicantsSelector,
} from "../../../api/actions";

import {
    Assignment,
    Application,
    Applicant,
    Position,
} from "../../../api/defs/types";

import {
    matchesSelector,
    guaranteesSelector,
    notesSelector,
    batchUpsertMatches,
    selectedPositionSelector,
} from "./actions";
import {
    PositionSummary,
    ApplicantSummary,
    Match,
    AppointmentGuaranteeStatus,
    FillStatus,
} from "./types";

import { PositionList } from "./position-list";
import { ApplicantView } from "./applicant-view/applicant-view";

import { ImportMatchingDataButton } from "./import-export/import-matching-data";
import { ExportMatchingDataButton } from "./import-export/export-matching-data";
import { ImportGuaranteesButton } from "./import-export/import-guarantees";

import { FinalizeChangesButton } from "./finalize-changes";
import "./styles.css";

export function AdminMatchingView() {
    const activeSession = useSelector(activeSessionSelector);
    const dispatch = useThunkDispatch();

    const positions = useSelector(positionsSelector);
    const assignments = useSelector(assignmentsSelector);
    const applications = useSelector(applicationsSelector);
    const applicants = useSelector(applicantsSelector);
    const matches = useSelector(matchesSelector);
    const guarantees = useSelector(guaranteesSelector);
    const notes = useSelector(notesSelector);

    // We don't load postings by default, so we load them dynamically whenever
    // we view this page.
    React.useEffect(() => {
        async function fetchResources() {
            return await dispatch(fetchPostings());
        }

        if (activeSession) {
            fetchResources();
        }
    }, [activeSession, dispatch]);

    // Compute and keep track of the combined applications for each applicant
    const combinedApplicationsByApplicantId: Record<number, Application> =
        React.useMemo(() => {
            const ret: Record<number, Application> = {};
            for (const applicant of applicants) {
                const combinedApplication = getCombinedApplication(
                    applicant,
                    applications
                );
                if (combinedApplication) {
                    ret[applicant.id] = combinedApplication;
                }
            }

            return ret;
        }, [applicants, applications]);

    // Initialize the set of matches in Redux on loading the component:
    React.useEffect(() => {
        const initialMatches: Match[] = getInitialMatchState(
            applicants,
            combinedApplicationsByApplicantId,
            assignments
        );
        dispatch(batchUpsertMatches(initialMatches));
    }, [dispatch, applicants, assignments, combinedApplicationsByApplicantId]);

    // Get information about positions
    const positionSummaries = React.useMemo(() => {
        const applicantSummariesByPositionId =
            getApplicantSummariesByPositionId(
                applicants,
                combinedApplicationsByApplicantId,
                assignments,
                matches,
                guarantees,
                notes
            );

        return getPositionSummariesByPositionId(
            positions,
            matches,
            applicantSummariesByPositionId
        );
    }, [
        applicants,
        combinedApplicationsByApplicantId,
        assignments,
        positions,
        matches,
        guarantees,
        notes,
    ]);

    const selectedPositionId = useSelector(selectedPositionSelector);
    const selectedPositionSummary: PositionSummary | null =
        React.useMemo(() => {
            if (!selectedPositionId) {
                return null;
            }

            return positionSummaries[selectedPositionId];
        }, [selectedPositionId, positionSummaries]);

    return (
        <div className="page-body">
            <ContentArea>
                <div className="matching-container">
                    <div className="matching-body">
                        <PositionList
                            selectedPositionId={selectedPositionId}
                            positionSummaries={positionSummaries}
                        />
                        <ApplicantView
                            positionSummary={selectedPositionSummary}
                        />
                    </div>
                    <div className="matching-footer">
                        <ImportMatchingDataButton />
                        <ImportGuaranteesButton />
                        <ExportMatchingDataButton />
                        <div className="footer-button-separator" />
                        <FinalizeChangesButton />
                    </div>
                </div>
            </ContentArea>
        </div>
    );
}

/**
 * Returns a list of Match objects given a list of applicants, applications, and assignments.
 */
function getInitialMatchState(
    applicants: Applicant[],
    applications: Record<number, Application>,
    assignments: Assignment[]
) {
    const initialMatches: Match[] = [];

    for (const applicant of applicants) {
        const combinedApplication = applications[applicant.id];
        if (!combinedApplication) {
            continue;
        }

        // Mark positions as being applied for
        for (const positionPreference of combinedApplication.position_preferences) {
            initialMatches.push({
                utorid: applicant.utorid,
                positionCode: positionPreference.position.position_code,
                status: "applied",
                hoursAssigned: 0,
            });
        }
    }

    // Mark positions as being assigned
    for (const assignment of assignments) {
        const matchingAssignment = initialMatches.find(
            (match) =>
                match.utorid === assignment.applicant.utorid &&
                match.positionCode === assignment.position.position_code
        );

        // Update existing match object if it exists
        if (matchingAssignment) {
            matchingAssignment.status = "assigned";
            matchingAssignment.hoursAssigned = assignment.hours
                ? assignment.hours
                : 0;
        } else {
            // Otherwise, create a new one
            initialMatches.push({
                utorid: assignment.applicant.utorid,
                positionCode: assignment.position.position_code,
                status: "assigned",
                hoursAssigned: assignment.hours ? assignment.hours : 0,
            });
        }
    }

    return initialMatches;
}

/**
 * Takes an Applicant and list of Applications and returns a new Application
 * as the consolidation of the applicant's applications.
 */
function getCombinedApplication(
    applicant: Applicant,
    applications: Application[]
) {
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
    for (const applications of Object.values(applicationsByPosting)) {
        applications.sort((a, b) => {
            if (a.submission_date === b.submission_date) {
                return 0;
            }
            if (a.submission_date > b.submission_date) {
                return 1;
            }
            return -1;
        });

        const newestApplication = applications[applications.length - 1];
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
                    combinedApplication.position_preferences.push(positionPref);
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
}

/**
 * Returns a record of applicant summaries mapped to the position IDs
 * in which they should appear.
 */
function getApplicantSummariesByPositionId(
    applicants: Applicant[],
    applications: Record<number, Application>,
    assignments: Assignment[],
    matches: Match[],
    guarantees: AppointmentGuaranteeStatus[],
    notes: Record<string, string | null>
) {
    const ret: Record<number, ApplicantSummary[]> = {};
    for (const applicant of applicants) {
        if (!applications[applicant.id]) {
            continue;
        }

        const applicantMatches =
            matches.filter((match) => match.utorid === applicant.utorid) || [];

        const applicantGuarantee =
            guarantees.find(
                (guarantee) => guarantee.utorid === applicant.utorid
            ) || null;

        const newApplicantSummary = {
            applicant: applicant,
            application: applications[applicant.id],
            matches: applicantMatches,
            guarantee: applicantGuarantee,
            note: notes[applicant.utorid] || null,
        };

        // Add summary to positions the applicant applied to:
        if (newApplicantSummary.application?.position_preferences) {
            for (const position of newApplicantSummary.application
                .position_preferences) {
                ret[position.position.id] = ret[position.position.id] || [];
                ret[position.position.id].push(newApplicantSummary);
            }
        }

        // Add summary to positions where the applicant has been assigned:
        for (const assignment of assignments.filter(
            (assignment) => assignment.applicant.id === applicant.id
        )) {
            ret[assignment.position.id] = ret[assignment.position.id] || [];

            const existingSummary = ret[assignment.position.id].find(
                (summary) => summary.applicant.id === applicant.id
            );

            // Add the applicant summary to the position only if the summary does not already exist
            if (!existingSummary) {
                ret[assignment.position.id].push(newApplicantSummary);
            }
        }
    }
    return ret;
}

/**
 * Returns a record mapping position summaries to position IDs.
 */
function getPositionSummariesByPositionId(
    positions: Position[],
    matches: Match[],
    applicantSummariesByPositionId: Record<number, ApplicantSummary[]>
) {
    const ret: Record<number, PositionSummary> = {};

    for (const position of positions) {
        const targetHours = round(
            position.hours_per_assignment *
                (position.desired_num_assignments || 0),
            2
        );

        let hoursAssigned = 0;
        for (const match of matches.filter(
            (match) =>
                ["assigned", "staged-assigned"].includes(match.status) &&
                match.positionCode === position.position_code
        )) {
            hoursAssigned += match.hoursAssigned;
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
            position,
            hoursAssigned,
            filledStatus,
            applicantSummaries:
                applicantSummariesByPositionId[position.id] || [],
        };
    }

    return ret;
}
