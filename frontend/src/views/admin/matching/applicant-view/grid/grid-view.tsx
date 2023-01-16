import React from "react";
import { Position } from "../../../../../api/defs/types";
import { ApplicantSummary, MatchStatus } from "../../types";
import { getApplicantMatchForPosition } from "../../utils";
import { ConnectedApplicantPill } from "./grid-item";
import { matchingStatusToString } from "../";
import { FaLock } from "react-icons/fa";

/**
 * A presentation of applicants and their summaries in a grid-based view.
 * Applicants are divided into sections based on match status (e.g., applied, staged-assigned).
 */
export function GridView({
    position,
    applicantSummaries,
}: {
    position: Position;
    applicantSummaries: ApplicantSummary[];
}) {
    const applicantSummariesByMatchStatus: Record<
        MatchStatus,
        ApplicantSummary[]
    > = React.useMemo(() => {
        const ret: Record<MatchStatus, ApplicantSummary[]> = {
            applied: [],
            starred: [],
            "staged-assigned": [],
            assigned: [],
            unassignable: [],
            hidden: [],
        };

        for (const applicantSummary of applicantSummaries) {
            const applicantMatch = getApplicantMatchForPosition(
                applicantSummary,
                position
            );

            if (!applicantMatch || !applicantMatch.status) {
                continue;
            }

            ret[applicantMatch.status] = ret[applicantMatch.status] || [];
            ret[applicantMatch.status].push(applicantSummary);
        }

        return ret;
    }, [applicantSummaries, position]);

    const statusList: MatchStatus[] = [
        "assigned",
        "staged-assigned",
        "starred",
        "applied",
        "unassignable",
        "hidden",
    ];

    return (
        <React.Fragment>
            {statusList.map((status) => {
                return (
                    <GridSection
                        key={status}
                        header={matchingStatusToString[status]}
                        applicantSummaries={
                            applicantSummariesByMatchStatus[status]
                        }
                        position={position}
                    />
                );
            })}
        </React.Fragment>
    );
}

/**
 * A section/collection of grid items for a specified match status (e.g., applied, staged-assigned).
 */
function GridSection({
    header,
    applicantSummaries,
    position,
}: {
    header: string;
    applicantSummaries: ApplicantSummary[];
    position: Position;
}) {
    // Don't show the section if there are no applicants
    if (applicantSummaries.length === 0) {
        return null;
    }

    return (
        <div className="grid-view-section">
            <h4>
                {header}
                {header === "Assigned" && (
                    <FaLock
                        className="header-lock"
                        title="These assignments can only be changed through the Assignments &
            Positions > Assignments tab."
                    />
                )}
                {header === "Unassignable" && (
                    <FaLock
                        className="header-lock"
                        title="These applicants have an assignment for this position that was previously
            rejected/withdrawn, and can only be changed through the Assignments & Positions > Assignments tab."
                        />
                )}
            </h4>
            <div className="grid-view-list">
                {applicantSummaries.map((applicantSummary) => {
                    return (
                        <ConnectedApplicantPill
                            applicantSummary={applicantSummary}
                            position={position}
                            key={applicantSummary.applicant.id}
                        />
                    );
                })}
            </div>
        </div>
    );
}
