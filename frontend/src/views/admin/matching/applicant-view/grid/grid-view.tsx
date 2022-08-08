import React from "react";
import { Position } from "../../../../../api/defs/types";
import { ApplicantSummary } from "../../types";
import { getApplicantMatchForPosition } from "../../utils";
import { statusMapping } from "../applicant-view";
import { GridItem } from "./grid-item";

import { FaLock } from "react-icons/fa";
import "../../styles.css";

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
    const applicantSummariesByMatchStatus: Record<string, ApplicantSummary[]> =
        React.useMemo(() => {
            const ret: Record<string, ApplicantSummary[]> = {
                Assigned: [],
                "Assigned (Staged)": [],
                Starred: [],
                Applied: [],
                Hidden: [],
            };

            for (const applicantSummary of applicantSummaries) {
                const applicantMatch = getApplicantMatchForPosition(
                    applicantSummary,
                    position
                );

                if (!applicantMatch || !applicantMatch.status) {
                    continue;
                }

                const category = statusMapping[applicantMatch.status];
                ret[category].push(applicantSummary);
            }

            return ret;
        }, [applicantSummaries, position]);

    return (
        <div>
            {Object.keys(applicantSummariesByMatchStatus).map((key, index) => {
                return (
                    <GridSection
                        key={index}
                        header={key}
                        applicantSummaries={
                            applicantSummariesByMatchStatus[key]
                        }
                        position={position}
                    />
                );
            })}
        </div>
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
                {header}{" "}
                {header === "Assigned" ? (
                    <FaLock
                        className="header-lock"
                        title="These assignments can only be changed through the Assignments &
            Positions > Assignments tab."
                    />
                ) : (
                    ""
                )}
            </h4>
            <div className="grid-view-list">
                {applicantSummaries.map((applicantSummary) => {
                    return (
                        <GridItem
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
