import React from "react";

import { ContentArea } from "../../../components/layout";
import { useSelector } from "react-redux";
import { activeSessionSelector, fetchPostings } from "../../../api/actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { sum } from "../../../api/mockAPI/utils";
import { round } from "../../../libs/utils";

import { applicationsSelector, assignmentsSelector, positionsSelector, applicantsSelector } from "../../../api/actions";
import { Assignment } from "../../../api/defs/types";

import { matchesSelector, guaranteesSelector, setSelectedRows } from "./actions";
import { PositionSummary, ApplicantSummary } from "./types";

import { PositionList } from "./position-list";
import { ApplicantView } from "./applicant-view";

export function AdminMatchingView() {
    const activeSession = useSelector(activeSessionSelector);
    const dispatch = useThunkDispatch();

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

    const [selectedPosition, setSelectedPosition] = React.useState(null);

    const positions = useSelector(positionsSelector);
    const assignments = useSelector(assignmentsSelector);
    const applications = useSelector(applicationsSelector);
    const applicants = useSelector(applicantsSelector);
    const matches = useSelector(matchesSelector);
    const guarantees = useSelector(guaranteesSelector);

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
            // Get newest application for each applicant
            const matchingApplications = applications.filter(
                (application) => application.applicant.id === applicant.id
            );

            if (matchingApplications.length === 0) {
                continue;
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

            const newApplicantSummary = {
                applicant: applicant,
                mostRecentApplication: matchingApplications[matchingApplications.length - 1],
                matches: matches.filter(
                    (match) => match.applicant.id === applicant.id
                ) || [],
                guarantee: guarantees.find(
                    (guarantee) => guarantee.applicant.id === applicant.id
                ) || null
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
