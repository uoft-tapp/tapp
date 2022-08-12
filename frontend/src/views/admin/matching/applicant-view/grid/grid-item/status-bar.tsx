import React from "react";
import classNames from "classnames";
import { ApplicantSummary, FillStatus } from "../../../types";
import { round } from "../../../../../../libs/utils";
import { getApplicantTotalHoursAssigned } from "../../../utils";

/**
 * A status bar for a grid item that displays information about how many hours have been
 * assigned to an application and how many hours they're owed.
 */
export function GridItemStatusBar({
    applicantSummary,
}: {
    applicantSummary: ApplicantSummary;
}) {
    const hoursOwed = applicantSummary.guarantee?.minHoursOwed || 0;
    const totalAssignedHours = React.useMemo(() => {
        if (!applicantSummary) {
            return 0;
        }

        return round(
            getApplicantTotalHoursAssigned(applicantSummary) +
                (applicantSummary.guarantee?.previousHoursFulfilled || 0),
            2
        );
    }, [applicantSummary]);

    const filledStatus = React.useMemo(() => {
        let ret: FillStatus | "" = "";
        if (totalAssignedHours > hoursOwed) {
            ret = "over";
        } else if (hoursOwed > 0) {
            if (totalAssignedHours === 0) {
                ret = "empty";
            } else if (totalAssignedHours === hoursOwed) {
                ret = "matched";
            } else {
                ret = "under";
            }
        }

        return ret;
    }, [hoursOwed, totalAssignedHours]);

    return (
        <div className={classNames("applicant-status-sidebar", filledStatus)}>
            <div className="applicant-status-value">{totalAssignedHours}</div>
            <div className="applicant-status-divider" />
            <div className="applicant-status-value">{hoursOwed}</div>
        </div>
    );
}
