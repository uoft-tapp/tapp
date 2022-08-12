import { Position } from "../../../../../api/defs/types";
import { ApplicantSummary, MatchableAssignment } from "../../types";
import { sum, round } from "../../../../../libs/utils";
import React from "react";
import {
    getApplicantMatchForPosition,
    getPositionPrefForPosition,
    getApplicantTotalHoursAssigned,
} from "../../utils";
import { matchingStatusToString } from "../";
import { AdvancedFilterTable } from "../../../../../components/filter-table/advanced-filter-table";
import { departmentCodes, programCodes } from "../../name-maps";

const DEFAULT_COLUMNS = [
    { Header: "Status", accessor: "status" },
    { Header: "First Name", accessor: "first_name" },
    { Header: "Last Name", accessor: "last_name" },
    { Header: "UTORid", accessor: "utorid" },
    { Header: "Department", accessor: "department" },
    { Header: "Program", accessor: "program" },
    { Header: "YIP", accessor: "yip" },
    { Header: "GPA", accessor: "gpa" },
    { Header: "TA Rating", accessor: "taPreference" },
    { Header: "Instructor Rating", accessor: "instructorPreference" },
    { Header: "Assignments", accessor: "assignments" },
    { Header: "Hours Assigned", accessor: "totalHoursAssigned" },
    { Header: "Hours Previously Assigned", accessor: "previousHoursFulfilled" },
    { Header: "Total Guaranteed Hours", accessor: "guaranteedHours" },
];

/**
 * A presentation of applicant information in table view, using a AdvancedFilterTable.
 */
export function TableView({
    position,
    applicantSummaries,
}: {
    position: Position;
    applicantSummaries: ApplicantSummary[];
}) {
    const positionPrefsByApplicantId: Record<number, number | null> =
        React.useMemo(() => {
            const ret: Record<number, number | null> = {};
            for (const summary of applicantSummaries) {
                ret[summary.applicant.id] =
                    getPositionPrefForPosition(summary.application, position)
                        ?.preference_level || null;
            }

            return ret;
        }, [applicantSummaries, position]);

    const applicantMatchesByApplicantId: Record<
        number,
        MatchableAssignment | null
    > = React.useMemo(() => {
        const ret: Record<number, MatchableAssignment | null> = {};
        for (const summary of applicantSummaries) {
            ret[summary.applicant.id] = getApplicantMatchForPosition(
                summary,
                position
            );
        }

        return ret;
    }, [applicantSummaries, position]);

    const mappedSummaries = applicantSummaries.map((summary) => {
        const instructorRatings =
            summary.application?.instructor_preferences
                .filter((pref) => pref.position.id === position.id)
                .map((rating) => {
                    return rating.preference_level;
                }) || [];

        const avgInstructorRating =
            instructorRatings.length > 0
                ? round(sum(...instructorRatings) / instructorRatings.length, 3)
                : null;

        const match = applicantMatchesByApplicantId[summary.applicant.id];

        let statusCategory = "";
        if (match) {
            statusCategory = matchingStatusToString[match.status];
            if (
                statusCategory === "Assigned" ||
                statusCategory === "Assigned (Staged)"
            ) {
                statusCategory += ` (${match.hoursAssigned || "0"})`;
            }
        }

        return {
            status: statusCategory,
            last_name: summary.applicant.last_name,
            first_name: summary.applicant.first_name,
            utorid: summary.applicant.utorid,
            department: summary.application?.department
                ? departmentCodes[summary.application?.department]["full"]
                : "",
            program: summary.application?.program
                ? programCodes[summary.application?.program]["full"]
                : "",
            yip: summary.application?.yip,
            gpa: summary.application?.gpa,
            taPreference: positionPrefsByApplicantId[summary.applicant.id],
            instructorPreference: avgInstructorRating,
            assignments: formatAssignedCourses(summary),
            totalHoursAssigned: getApplicantTotalHoursAssigned(summary),
            previousHoursFulfilled: summary.guarantee?.previousHoursFulfilled,
            guaranteedHours: `${
                summary.guarantee?.minHoursOwed
                    ? `${summary.guarantee.minHoursOwed}
                ${
                    summary.guarantee.maxHoursOwed
                        ? ` - ${summary.guarantee.maxHoursOwed}`
                        : ""
                }`
                    : ""
            }`,
        };
    });

    return (
        <AdvancedFilterTable columns={DEFAULT_COLUMNS} data={mappedSummaries} />
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
                return `${match.position.position_code} (${match.hoursAssigned})`;
            }
            return null;
        })
        .filter((match) => match)
        .join("\n");
}
