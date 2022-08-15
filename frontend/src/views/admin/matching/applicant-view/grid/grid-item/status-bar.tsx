import React from "react";
import classNames from "classnames";
import { ApplicantSummary } from "../../../types";

/**
 * A status bar for a grid item that displays information about how many hours have been
 * assigned to an application and how many hours they're owed.
 */
export function GridItemStatusBar({
    applicantSummary,
}: {
    applicantSummary: ApplicantSummary;
}) {
    return (
        <div
            className={classNames(
                "applicant-status-sidebar",
                applicantSummary.filledStatus
            )}
        >
            <div className="applicant-status-value">
                {applicantSummary.hoursAssigned}
            </div>
            <div className="applicant-status-divider" />
            <div className="applicant-status-value">
                {applicantSummary.guarantee?.minHoursOwed || 0}
            </div>
        </div>
    );
}
