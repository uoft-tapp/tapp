import React from "react";
import { ApplicantSummary, MatchableAssignment } from "../../../types";
import { sum, round } from "../../../../../../libs/utils";
import { getPositionPrefForPosition } from "../../../utils";
import { ApplicantNote } from "./applicant-note";
import { ApplicantStar } from "./applicant-star";
import { departmentCodes, programCodes } from "../../../name-maps";

/**
 * The main body of a grid item, presenting most of the information for an applicant.
 */
export function GridItemBody({
    applicantSummary,
    match,
}: {
    applicantSummary: ApplicantSummary;
    match: MatchableAssignment;
}) {
    const positionPref = React.useMemo(() => {
        return getPositionPrefForPosition(
            applicantSummary.application,
            match.position
        );
    }, [match, applicantSummary]);

    const instructorRatings = React.useMemo(() => {
        if (!applicantSummary.application?.instructor_preferences) {
            return [];
        }

        return applicantSummary.application.instructor_preferences
            .filter((pref) => pref.position.id === match.position.id)
            .map((rating) => {
                return rating.preference_level;
            });
    }, [applicantSummary, match]);

    const avgInstructorRating =
        instructorRatings.length > 0
            ? round(sum(...instructorRatings) / instructorRatings.length, 3)
            : null;

    const isAssigned =
        match.status === "assigned" || match.status === "staged-assigned";

    const deptCode = applicantSummary.application?.department
        ? departmentCodes[applicantSummary.application.department]
        : null;

    const progCode = applicantSummary.application?.program
        ? programCodes[applicantSummary.application.program]
        : null;

    return (
        <div className="applicant-grid-main">
            <div className="grid-row">
                <div className="applicant-name">
                    {`${applicantSummary.applicant.first_name} ${applicantSummary.applicant.last_name}`}
                </div>
                {isAssigned && (
                    <div className="applicant-hours">
                        ({match.hoursAssigned})
                    </div>
                )}
                {!isAssigned && (
                    <div
                        className="icon-container"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <ApplicantStar match={match} />
                    </div>
                )}
            </div>
            <div className="grid-row">
                <div
                    className="grid-detail-small"
                    title={
                        deptCode
                            ? deptCode["full"]
                            : applicantSummary.application?.department
                            ? `Other (${applicantSummary.application?.department})`
                            : ""
                    }
                >
                    {deptCode
                        ? deptCode["abbrev"]
                        : applicantSummary.application?.department
                        ? "o"
                        : ""}
                </div>
                <div
                    className="grid-detail-small"
                    title={
                        progCode
                            ? progCode["full"]
                            : applicantSummary.application?.program
                            ? `Other (${applicantSummary.application?.program})`
                            : ""
                    }
                >
                    {progCode
                        ? progCode["abbrev"]
                        : applicantSummary.application?.program
                        ? "o"
                        : ""}
                    {applicantSummary.application?.yip}
                </div>
                <div
                    className="grid-detail-small"
                    title="TA's preference level"
                >
                    {positionPref?.preference_level}
                </div>
                <div
                    className="grid-detail-small"
                    title="Average instructor rating"
                >
                    {avgInstructorRating || ""}
                </div>
                <div
                    className="icon-container"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <ApplicantNote applicantSummary={applicantSummary} />
                </div>
            </div>
        </div>
    );
}
