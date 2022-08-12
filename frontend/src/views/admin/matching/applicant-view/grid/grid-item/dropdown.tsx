import React from "react";
import { ApplicantSummary, MatchableAssignment } from "../../../types";
import { Collapse } from "react-bootstrap";
import { upsertMatch } from "../../../actions";
import { useThunkDispatch } from "../../../../../../libs/thunk-dispatch";

/**
 * A dropdown list of actions to perform on an applicant/grid item.
 */
export function GridItemDropdown({
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
