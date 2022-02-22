import React from "react";
import { useSelector } from "react-redux";
import {
    applicationsSelector,
    assignmentsSelector,
} from "../../../api/actions";
import { Applicant } from "../../../api/defs/types";
import { sum } from "../../../api/mockAPI/utils";

import "./applicant-pill.css";

export function ApplicantPill({ applicant }: { applicant: Applicant }) {
    const applications = useSelector(applicationsSelector);
    const assignments = useSelector(assignmentsSelector);

    const application = React.useMemo(() => {
        const matchingApplications = applications.filter(
            (application) => application.applicant.id === applicant.id
        );
        if (matchingApplications.length === 0) {
            return null;
        }
        if (matchingApplications.length === 1) {
            return matchingApplications[0];
        }
        // We need to find the most recently completed application
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
    }, [applications, applicant]);

    let annotation = "?";
    if (application) {
        annotation = `${application.annotation || ""}${
            application.program || "?"
        }${application.yip == null ? "" : application.yip}`;
    }

    const activeAssignments = React.useMemo(() => {
        return assignments.filter(
            (assignment) =>
                assignment.applicant.id === applicant.id &&
                ["accepted", "pending", "provisional"].includes(
                    assignment.active_offer_status || ""
                )
        );
    }, [applicant, assignments]);
    const assignedHours = sum(
        ...activeAssignments.map((assignment) => assignment.hours)
    );

    return (
        <div className="applicant-pill">
            <div className="annotation">{annotation}</div>
            <div className="pill-body">
                <div className="name">
                    {applicant.first_name} {applicant.last_name}
                </div>
                <div className="hours">{assignedHours} hours</div>
            </div>
        </div>
    );
}
