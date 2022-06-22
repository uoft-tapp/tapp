import React from "react";

import { ContentArea } from "../../../components/layout";
import { useSelector } from "react-redux";
import { activeSessionSelector, fetchPostings } from "../../../api/actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { sum } from "../../../api/mockAPI/utils";
import { round } from "../../../libs/utils";

import { applicationsSelector, assignmentsSelector, positionsSelector, applicantsSelector } from "../../../api/actions";
import { Assignment, Application, Applicant } from "../../../api/defs/types";

import { matchesSelector, guaranteesSelector, upsertMatch, batchUpsertMatches } from "./actions";
import { PositionSummary, ApplicantSummary, Match } from "./types";

import { PositionList } from "./position-list";
import { ApplicantView } from "./applicant-view";

function GetNewestApplication(applicant: Applicant, applications: Application[]) {
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

    const [selectedPosition, setSelectedPosition] = React.useState(null);

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

        async function initializeMatches() {
            const initialMatches: Match[] = [];

            for (const applicant of applicants) {
                const mostRecentApplication = GetNewestApplication(applicant, applications);
                if (!mostRecentApplication) {
                    continue;
                }

                // Mark positions as being applied for
                for (const positionPreference of mostRecentApplication.position_preferences) {
                    initialMatches.push({
                        applicantId: applicant.id,
                        positionId: positionPreference.position.id,
                        status: "applied",
                        hoursAssigned: 0
                    });
                }
            }

            // Mark positions as being assigned
            for (const assignment of assignments) {
                const matchingAssignment = initialMatches.find(
                    (match) => (match.applicantId === assignment.applicant.id && match.positionId === assignment.position.id && match.status === "applied"));

                // Update existing match object if it exists
                if (matchingAssignment) {
                    matchingAssignment.status = "assigned";
                    matchingAssignment.hoursAssigned = assignment.hours ? assignment.hours : 0;
                } else {
                    // Otherwise, create a new one
                    initialMatches.push({
                        applicantId: assignment.applicant.id,
                        positionId: assignment.position.id,
                        status: "assigned",
                        hoursAssigned: assignment.hours ? assignment.hours : 0
                    });
                }
            }

            return await dispatch(batchUpsertMatches(initialMatches));
        }

        if (activeSession) {
            fetchResources();
            initializeMatches();
        }
    }, [activeSession, dispatch]);

    // Get information about positions
    const positionSummaries = React.useMemo(() => {
        const assignmentsByPositionId: Record<number, Assignment[]> = {};
        for (const assignment of assignments) {
            assignmentsByPositionId[assignment.position.id] =
                assignmentsByPositionId[assignment.position.id] || [];
            assignmentsByPositionId[assignment.position.id].push(assignment);
        }

        const applicantSummariesByPositionId: Record<number, ApplicantSummary[]> = {};
        for (const applicant of applicants) {
            const newestApplication = GetNewestApplication(applicant, applications);
            if (!newestApplication) {
                continue;
            }

            const applicantMatches = matches.filter(
                (match) => match.applicantId === applicant.id
            ) || [];

            const applicantGuarantee = guarantees.find(
                (guarantee) => guarantee.applicant.id === applicant.id
            ) || null;

            const newApplicantSummary = {
                applicant: applicant,
                mostRecentApplication: newestApplication,
                matches: applicantMatches,
                guarantee: applicantGuarantee
            }

            newApplicantSummary.mostRecentApplication.position_preferences.forEach(position => {
                applicantSummariesByPositionId[position.position.id] =
                    applicantSummariesByPositionId[position.position.id] || [];
                applicantSummariesByPositionId[position.position.id].push(newApplicantSummary);
            })
        }

        const ret: Record<number, PositionSummary> = {};
        for (const position of positions) {
            const assignmentsForPosition =
                assignmentsByPositionId[position.id] || [];

            const activeAssignments = assignmentsForPosition.filter(
                (assignment) =>
                    ["accepted", "provisional", "pending"].includes(
                        assignment.active_offer_status || ""
                    )
            );
            const targetHours = round(
                position.hours_per_assignment *
                    (position.desired_num_assignments || 0),
                2
            );
            const hoursAssigned = round(
                sum(...activeAssignments.map((assignment) => assignment.hours)),
                2
            );
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
                applicantSummaries: applicantSummariesByPositionId[position.id] || []
            };
        }
        return ret;
    }, [positions, assignments, applications, applicants, matches, guarantees]);

    return (
        <div className="page-body">
            <ContentArea>
            <div className="matching-container">
                <PositionList 
                    currPosition={selectedPosition}
                    summaries={positionSummaries}
                    onClick={setSelectedPosition}
                />
                <ApplicantView
                    summary={selectedPosition}
                />
            </div>
            </ContentArea>
        </div>
    );
}
