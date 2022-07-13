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
import { Assignment, Application, Applicant } from "../../../api/defs/types";

import {
    matchesSelector,
    guaranteesSelector,
    batchUpsertMatches,
} from "./actions";
import { PositionSummary, ApplicantSummary, Match } from "./types";

import { PositionList } from "./position-list";
import { ApplicantView } from "./applicant-view";

import {
    ImportMatchingDataButton,
    ImportGuaranteesButton,
    ExportMatchingDataButton,
} from "./import-export";
import { FinalizeChangesButton } from "./finalize-changes";

function getNewestApplication(
    applicant: Applicant,
    applications: Application[]
) {
    const matchingApplications = applications.filter(
        (application) => application.applicant.id === applicant.id
    );

    if (matchingApplications.length === 0) {
        return null;
    }

    matchingApplications.sort((a, b) => {
        if (a.submission_date === b.submission_date) {
            return 0;
        }
        if (a.submission_date > b.submission_date) {
            return 1;
        }
        return -1;
    });

    return matchingApplications[matchingApplications.length - 1];
}

export function AdminMatchingView() {
    const activeSession = useSelector(activeSessionSelector);
    const dispatch = useThunkDispatch();

    const [selectedPosition, setSelectedPosition] =
        React.useState<PositionSummary | null>(null);
    const [markAsUpdated, setMarkAsUpdated] = React.useState(false);

    const positions = useSelector(positionsSelector);
    const assignments = useSelector(assignmentsSelector);
    const applications = useSelector(applicationsSelector);
    const applicants = useSelector(applicantsSelector);
    const matches = useSelector(matchesSelector);
    const guarantees = useSelector(guaranteesSelector);

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

    React.useEffect(() => {
        async function initializeMatches() {
            const initialMatches: Match[] = [];

            for (const applicant of applicants) {
                const mostRecentApplication = getNewestApplication(
                    applicant,
                    applications
                );
                if (!mostRecentApplication) {
                    continue;
                }

                // Mark positions as being applied for
                for (const positionPreference of mostRecentApplication.position_preferences) {
                    initialMatches.push({
                        applicantId: applicant.id,
                        utorid: applicant.utorid,
                        positionId: positionPreference.position.id,
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
                        match.applicantId === assignment.applicant.id &&
                        match.positionId === assignment.position.id &&
                        match.status === "applied"
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
                        applicantId: assignment.applicant.id,
                        utorid: assignment.applicant.utorid,
                        positionId: assignment.position.id,
                        positionCode: assignment.position.position_code,
                        status: "assigned",
                        hoursAssigned: assignment.hours ? assignment.hours : 0,
                    });
                }
            }

            return await dispatch(batchUpsertMatches(initialMatches));
        }

        initializeMatches();
    }, [dispatch, applicants, assignments, applications]);

    // Get information about positions
    const positionSummaries = React.useMemo(() => {
        const assignmentsByPositionId: Record<number, Assignment[]> = {};
        for (const assignment of assignments) {
            assignmentsByPositionId[assignment.position.id] =
                assignmentsByPositionId[assignment.position.id] || [];
            assignmentsByPositionId[assignment.position.id].push(assignment);
        }

        const applicantSummariesByPositionId: Record<
            number,
            ApplicantSummary[]
        > = {};
        for (const applicant of applicants) {
            const newestApplication = getNewestApplication(
                applicant,
                applications
            );
            if (!newestApplication) {
                continue;
            }

            const applicantMatches =
                matches.filter((match) => match.applicantId === applicant.id) ||
                [];

            const applicantGuarantee =
                guarantees.find(
                    (guarantee) => guarantee.utorid === applicant.utorid
                ) || null;

            const newApplicantSummary = {
                applicant: applicant,
                application: newestApplication,
                matches: applicantMatches,
                guarantee: applicantGuarantee,
            };

            for (const position of newApplicantSummary.application.position_preferences) {
                applicantSummariesByPositionId[position.position.id] =
                    applicantSummariesByPositionId[position.position.id] ||
                    [];
                applicantSummariesByPositionId[position.position.id].push(
                    newApplicantSummary
                );
            };

            // Add summary to positions where the applicant has been assigned:
            for (const assignment of assignments.filter((assignment) => assignment.applicant.id === applicant.id)) {
                applicantSummariesByPositionId[assignment.position.id] =
                    applicantSummariesByPositionId[
                        assignment.position.id
                    ] || [];

                const existingSummary = applicantSummariesByPositionId[
                    assignment.position.id
                ].find((summary) => summary.applicant.id === applicant.id);

                // Add the applicant summary to the position only if the summary does not already exist
                if (!existingSummary) {
                    applicantSummariesByPositionId[
                        assignment.position.id
                    ].push(newApplicantSummary);
                }
            };
        }

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
                    match.positionId === position.id
            )) {
                hoursAssigned += match.hoursAssigned;
            }

            let filledStatus: "empty" | "under" | "matched" | "over" = "empty";
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
                assignments: assignmentsByPositionId[position.id] || [],
                applicantSummaries:
                    applicantSummariesByPositionId[position.id] || [],
            };
        }

        return ret;
    }, [positions, assignments, applications, applicants, matches, guarantees]);

    let currApplicants: ApplicantSummary[] = [];

    if (selectedPosition !== null) {
        currApplicants =
            positionSummaries[selectedPosition.position.id]?.applicantSummaries;
    }

    return (
        <div className="page-body">
            <ContentArea>
                <div className="matching-container">
                    <div className="matching-body">
                        <PositionList
                            currPosition={selectedPosition}
                            summaries={positionSummaries}
                            setSelectedPosition={setSelectedPosition}
                        />
                        <ApplicantView
                            position={selectedPosition?.position || null}
                            applicants={currApplicants}
                            setMarkAsUpdated={setMarkAsUpdated}
                        />
                    </div>
                    <div className="matching-footer">
                        <ImportMatchingDataButton
                            setMarkAsUpdated={setMarkAsUpdated}
                        />
                        <ImportGuaranteesButton
                            setMarkAsUpdated={setMarkAsUpdated}
                        />
                        <ExportMatchingDataButton
                            markAsUpdated={markAsUpdated}
                            setMarkAsUpdated={setMarkAsUpdated}
                        />
                        <div className="footer-button-separator" />
                        <FinalizeChangesButton />
                    </div>
                </div>
            </ContentArea>
        </div>
    );
}
