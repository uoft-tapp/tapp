import { Position } from "../../../../../api/defs/types";
import { ApplicantSummary } from "../../types";
import { Table } from "react-bootstrap";
import { sum, round } from "../../../../../libs/utils";
import React from "react";
import {
    getApplicantMatchForPosition,
    getPositionPrefForPosition,
    getApplicantTotalHoursAssigned,
} from "../../utils";
import { statusMapping } from "../applicant-view";

/**
 * A presentation of applicant information in table view.
 */
export function TableView({
    position,
    applicantSummaries,
}: {
    position: Position;
    applicantSummaries: ApplicantSummary[];
}) {
    return (
        <Table striped bordered hover responsive size="sm">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Last</th>
                    <th>First</th>
                    <th>UTORid</th>
                    <th>Department</th>
                    <th>Program</th>
                    <th>YIP</th>
                    <th>GPA</th>
                    <th>TA Rating</th>
                    <th>Instructor Rating</th>
                    <th>Assignments</th>
                    <th>Hours Assigned</th>
                    <th>Hours Previously Assigned</th>
                    <th>Guarantee Total</th>
                </tr>
            </thead>
            <tbody>
                {applicantSummaries.map((applicantSummary) => {
                    return (
                        <TableRow
                            applicantSummary={applicantSummary}
                            position={position}
                            key={applicantSummary.applicant.id}
                        />
                    );
                })}
            </tbody>
        </Table>
    );
}

/**
 * A row of applicant information to be presented in a table (TableView).
 */
function TableRow({
    position,
    applicantSummary,
}: {
    position: Position;
    applicantSummary: ApplicantSummary;
}) {
    const applicantMatch = getApplicantMatchForPosition(
        applicantSummary,
        position
    );

    const positionPref = React.useMemo(() => {
        return getPositionPrefForPosition(
            applicantSummary.application,
            position
        );
    }, [position, applicantSummary]);

    if (!applicantMatch) {
        return null;
    }

    const statusCategory = statusMapping[applicantMatch.status];

    const instructorRatings =
        applicantSummary.application.instructor_preferences
            .filter((pref) => pref.position.id === position.id)
            .map((rating) => {
                return rating.preference_level;
            }) || [];

    const avgInstructorRating =
        instructorRatings.length > 0
            ? round(sum(...instructorRatings) / instructorRatings.length, 3)
            : null;

    return (
        <tr>
            <td>
                {statusCategory}{" "}
                {statusCategory === "Assigned"
                    ? `(${applicantMatch?.hoursAssigned || "0"})`
                    : ""}
            </td>
            <td>{applicantSummary.applicant.last_name}</td>
            <td>{applicantSummary.applicant.first_name}</td>
            <td>{applicantSummary.applicant.utorid}</td>
            <td>{applicantSummary.application.department}</td>
            <td>{applicantSummary.application.program}</td>
            <td>{applicantSummary.application.yip}</td>
            <td>{applicantSummary.application.gpa || ""}</td>
            <td>{positionPref?.preference_level || ""}</td>
            <td>{avgInstructorRating || ""}</td>
            <td>{formatAssignedCourses(applicantSummary)}</td>
            <td>{getApplicantTotalHoursAssigned(applicantSummary)}</td>
            <td>{applicantSummary.guarantee?.previousHoursFulfilled || ""}</td>
            <td>{applicantSummary.guarantee?.totalHoursOwed || ""}</td>
        </tr>
    );
}

/**
 * Takes an applicant summary and returns a formatted string containing
 * the applicant's assignments and hours assigned, separated by newlines.
 */
function formatAssignedCourses(applicantSummary: ApplicantSummary) {
    return applicantSummary.matches
        .map((match) => {
            if (
                match.status === "assigned" ||
                match.status === "staged-assigned"
            ) {
                return `${match.positionCode} (${match.hoursAssigned})`;
            }
            return null;
        })
        .filter((match) => match)
        .join("\n");
}
