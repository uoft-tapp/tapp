import React from "react";
import classNames from "classnames";

import { Position, Application } from "../../../../../api/defs/types";
import { ApplicantSummary, MatchableAssignment, FillStatus } from "../../types";

import { Collapse } from "react-bootstrap";
import { sum, round } from "../../../../../libs/utils";

import { upsertMatch } from "../../actions";
import { useThunkDispatch } from "../../../../../libs/thunk-dispatch";

import {
    getApplicantMatchForPosition,
    getPositionPrefForPosition,
    getApplicantTotalHoursAssigned,
} from "../../utils";

import { ApplicantNote } from "./applicant-note";
import { ApplicantStar } from "./applicant-star";
import { AdjustHourModal, ApplicationDetailModal } from "./modals";

import { departmentCodes } from "../../name-maps";

/**
 * A grid item to be displayed in grid view, showing a summary of an applicant.
 */
export function GridItem({
    applicantSummary,
    position,
}: {
    applicantSummary: ApplicantSummary;
    position: Position;
}) {
    const [open, setOpen] = React.useState(false);
    const [shownApplication, setShownApplication] =
        React.useState<Application | null>(null);
    const [showChangeHours, setShowChangeHours] = React.useState(false);

    const match = getApplicantMatchForPosition(applicantSummary, position);

    if (!match) {
        return null;
    }

    return (
        // Entire item is marked as a dropdown trigger to access the list of actions
        <div
            className="applicant-dropdown-wrapper dropdown"
            onMouseLeave={() => setOpen(false)}
        >
            <div
                className="applicant-grid-item noselect"
                onClick={() => setOpen(!open)}
            >
                <GridItemSidebar applicantSummary={applicantSummary} />
                <GridItemBody
                    applicantSummary={applicantSummary}
                    match={match}
                />
            </div>
            <GridItemDropdown
                match={match}
                applicantSummary={applicantSummary}
                show={open}
                setShow={setOpen}
                setShownApplication={setShownApplication}
                setShowChangeHours={setShowChangeHours}
            />
            <ApplicationDetailModal
                application={shownApplication}
                setShownApplication={setShownApplication}
            />
            <AdjustHourModal
                match={match}
                show={showChangeHours}
                setShow={setShowChangeHours}
            />
        </div>
    );
}

/**
 * The main body of a grid item, presenting most of the information for an applicant.
 */
function GridItemBody({
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
                    title={deptCode ? deptCode["full"] : ""}
                >
                    {deptCode && deptCode["abbrev"]}
                </div>
                <div className="grid-detail-small">
                    {applicantSummary.application?.program?.charAt(0)}
                    {applicantSummary.application?.yip}
                </div>
                <div className="grid-detail-small">
                    {positionPref?.preference_level || ""}
                </div>
                <div className="grid-detail-small">
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

/**
 * A sidebar for a grid item that displays information about how many hours have been
 * assigned to an application and how many hours they're owed.
 */
function GridItemSidebar({
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

/**
 * A dropdown list of actions to perform on an applicant/grid item.
 */
function GridItemDropdown({
    match,
    applicantSummary,
    show,
    setShow,
    setShownApplication,
    setShowChangeHours,
}: {
    match: MatchableAssignment;
    applicantSummary: ApplicantSummary;
    show: boolean;
    setShow: Function;
    setShownApplication: Function;
    setShowChangeHours: Function;
}) {
    const dispatch = useThunkDispatch();
    const baseMatchValues = {
        positionCode: match.position.position_code,
        utorid: match.applicant.utorid,
    };

    const canBeAssigned =
        match.status === "hidden" ||
        match.status === "applied" ||
        match.status === "starred";

    const canBeHidden =
        match.status !== "assigned" && match.status !== "hidden";

    function assignToPosition() {
        dispatch(
            upsertMatch({
                ...baseMatchValues,
                stagedAssigned: true,
                stagedHoursAssigned: match.position.hours_per_assignment || 0,
            })
        );
    }

    function unassignFromPosition() {
        dispatch(
            upsertMatch({
                ...baseMatchValues,
                stagedAssigned: false,
                stagedHoursAssigned: 0,
            })
        );
    }

    function hideFromPosition() {
        dispatch(upsertMatch({ ...baseMatchValues, hidden: true }));
    }

    function unhideFromPosition() {
        dispatch(upsertMatch({ ...baseMatchValues, hidden: false }));
    }

    function hideFromAll() {
        for (const targetMatch of applicantSummary.matches) {
            dispatch(
                upsertMatch({
                    utorid: match.applicant.utorid,
                    positionCode: targetMatch.position.position_code,
                    hidden: true,
                })
            );
        }
    }

    function unhideFromAll() {
        for (const targetMatch of applicantSummary.matches) {
            dispatch(
                upsertMatch({
                    utorid: match.applicant.utorid,
                    positionCode: targetMatch.position.position_code,
                    hidden: false,
                })
            );
        }
    }

    return (
        <Collapse in={show}>
            <div className="applicant-dropdown-menu dropdown-menu noselect">
                <button
                    className="dropdown-item"
                    onClick={() => {
                        setShownApplication(applicantSummary.application);
                        setShow(false);
                    }}
                >
                    View application details
                </button>
                {canBeAssigned && (
                    <button
                        className="dropdown-item"
                        onClick={() => {
                            assignToPosition();
                            setShow(false);
                        }}
                    >
                        Assign to <b>{match.position.position_code}</b> (
                        {match.position.hours_per_assignment || 0})
                    </button>
                )}
                {match.status === "staged-assigned" && (
                    <button
                        className="dropdown-item"
                        onClick={() => {
                            setShowChangeHours(true);
                            setShow(false);
                        }}
                    >
                        Change assigned hours
                    </button>
                )}
                {match.status === "staged-assigned" && (
                    <button
                        className="dropdown-item"
                        onClick={() => {
                            unassignFromPosition();
                            setShow(false);
                        }}
                    >
                        Unassign from <b>{match.position.position_code}</b>
                    </button>
                )}
                {canBeHidden && (
                    <button
                        className="dropdown-item"
                        onClick={() => {
                            hideFromPosition();
                            setShow(false);
                        }}
                    >
                        Hide from <b>{match.position.position_code}</b>
                    </button>
                )}
                {canBeAssigned && (
                    <button
                        className="dropdown-item"
                        onClick={() => {
                            hideFromAll();
                            setShow(false);
                        }}
                    >
                        Hide from all courses
                    </button>
                )}
                {match.status === "hidden" && (
                    <>
                        <button
                            className="dropdown-item"
                            onClick={() => {
                                unhideFromPosition();
                                setShow(false);
                            }}
                        >
                            Unhide from <b>{match.position.position_code}</b>
                        </button>
                        <button
                            className="dropdown-item"
                            onClick={() => {
                                unhideFromAll();
                                setShow(false);
                            }}
                        >
                            Unhide from all courses
                        </button>
                    </>
                )}
            </div>
        </Collapse>
    );
}
