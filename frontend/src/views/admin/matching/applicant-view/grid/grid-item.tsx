import React from "react";
import classNames from "classnames";

import { Position, Application } from "../../../../../api/defs/types";
import { ApplicantSummary, Match } from "../../types";

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

    const dispatch = useThunkDispatch();
    const applicantMatch = getApplicantMatchForPosition(
        applicantSummary,
        position
    );

    if (!applicantMatch) {
        return null;
    }

    // Update all of this applicant's matches except for those in which they are assigned/staged-assigned
    function hideApplicantFromAll() {
        for (const match of applicantSummary.matches) {
            if (match.status === "applied") {
                const newMatch: Match = { ...match, status: "hidden" };
                dispatch(upsertMatch(newMatch));
            }
        }
    }

    // Update this applicant's match status
    function updateApplicantMatch(
        newStatus: "staged-assigned" | "hidden" | "starred" | "applied",
        hoursAssigned?: number
    ) {
        if (!applicantMatch) {
            return;
        }

        const newMatch: Match = {
            ...applicantMatch,
            status: newStatus,
        };

        if (hoursAssigned !== undefined) {
            newMatch.hoursAssigned = hoursAssigned;
        }

        dispatch(upsertMatch(newMatch));
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
                    position={position}
                    applicantSummary={applicantSummary}
                    match={applicantMatch}
                    updateApplicantMatch={updateApplicantMatch}
                />
            </div>
            <GridItemDropdown
                position={position}
                applicantMatch={applicantMatch}
                applicantSummary={applicantSummary}
                show={open}
                setShow={setOpen}
                setShownApplication={setShownApplication}
                setShowChangeHours={setShowChangeHours}
                updateApplicantMatch={updateApplicantMatch}
                hideApplicantFromAll={hideApplicantFromAll}
            />
            <ApplicationDetailModal
                application={shownApplication}
                setShownApplication={setShownApplication}
            />
            <AdjustHourModal
                applicantMatch={applicantMatch}
                updateApplicantMatch={updateApplicantMatch}
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
    position,
    applicantSummary,
    match,
    updateApplicantMatch,
}: {
    position: Position;
    applicantSummary: ApplicantSummary;
    match: Match;
    updateApplicantMatch: Function;
}) {
    const positionPref = React.useMemo(() => {
        return getPositionPrefForPosition(
            applicantSummary.application,
            position
        );
    }, [position, applicantSummary]);

    const instructorRatings = React.useMemo(() => {
        return applicantSummary.application.instructor_preferences
            .filter((pref) => pref.position.id === position.id)
            .map((rating) => {
                return rating.preference_level;
            });
    }, [applicantSummary, position.id]);

    const avgInstructorRating =
        instructorRatings.length > 0
            ? round(sum(...instructorRatings) / instructorRatings.length, 3)
            : null;

    return (
        <div className="applicant-grid-main">
            <div className="grid-row">
                <div className="applicant-name">
                    {applicantSummary.applicant.first_name}{" "}
                    {applicantSummary.applicant.last_name}
                </div>
                {match.status.includes("assigned") && (
                    <div className="applicant-hours">
                        {" "}
                        ({match.hoursAssigned})
                    </div>
                )}
                {!match.status.includes("assigned") && (
                    <div
                        className="icon-container"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <ApplicantStar
                            match={match}
                            updateApplicantMatch={updateApplicantMatch}
                        />
                    </div>
                )}
            </div>
            <div className="grid-row">
                <div className="grid-detail-small">
                    {applicantSummary.application.department
                        ?.charAt(0)
                        .toUpperCase()}
                </div>
                <div className="grid-detail-small">
                    {applicantSummary.application.program?.charAt(0)}
                    {applicantSummary.application.yip}
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
    applicantSummary: ApplicantSummary | null;
}) {
    const hoursOwed = applicantSummary?.guarantee?.totalHoursOwed || 0;
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
        let ret: "empty" | "under" | "matched" | "over" | "" = "";
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
    position,
    applicantMatch,
    applicantSummary,
    show,
    setShow,
    setShownApplication,
    setShowChangeHours,
    updateApplicantMatch,
    hideApplicantFromAll,
}: {
    position: Position;
    applicantMatch: Match | null;
    applicantSummary: ApplicantSummary;
    show: boolean;
    setShow: Function;
    setShownApplication: Function;
    setShowChangeHours: Function;
    updateApplicantMatch: Function;
    hideApplicantFromAll: Function;
}) {
    if (!applicantMatch) {
        return null;
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
                {applicantMatch.status &&
                    ["hidden", "applied", "starred"].includes(
                        applicantMatch?.status
                    ) && (
                        <button
                            className="dropdown-item"
                            onClick={() => {
                                updateApplicantMatch(
                                    "staged-assigned",
                                    position.hours_per_assignment || 0
                                );
                                setShow(false);
                            }}
                        >
                            Assign to <b>{position.position_code}</b> (
                            {position.hours_per_assignment || 0})
                        </button>
                    )}
                {applicantMatch.status === "staged-assigned" && (
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
                {applicantMatch.status === "staged-assigned" && (
                    <button
                        className="dropdown-item"
                        onClick={() => {
                            updateApplicantMatch("applied");
                            setShow(false);
                        }}
                    >
                        Unassign from <b>{position.position_code}</b>
                    </button>
                )}
                {applicantMatch.status !== "assigned" &&
                    applicantMatch.status !== "hidden" && (
                        <button
                            className="dropdown-item"
                            onClick={() => {
                                updateApplicantMatch("hidden");
                                setShow(false);
                            }}
                        >
                            Hide from <b>{position.position_code}</b>
                        </button>
                    )}
                {applicantMatch.status &&
                    ["hidden", "applied", "starred"].includes(
                        applicantMatch?.status
                    ) && (
                        <button
                            className="dropdown-item"
                            onClick={() => {
                                hideApplicantFromAll();
                                setShow(false);
                            }}
                        >
                            Hide from all courses
                        </button>
                    )}
                {applicantMatch.status === "hidden" && (
                    <button
                        className="dropdown-item"
                        onClick={() => {
                            updateApplicantMatch("applied");
                            setShow(false);
                        }}
                    >
                        Unhide from <b>{position.position_code}</b>
                    </button>
                )}
            </div>
        </Collapse>
    );
}
