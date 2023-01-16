import React from "react";
import { ApplicantSummary, MatchableAssignment } from "../../../types";
import { Application } from "../../../../../../api/defs/types";
import { Dropdown } from "react-bootstrap";
import { upsertMatch } from "../../../actions";
import { useThunkDispatch } from "../../../../../../libs/thunk-dispatch";

/**
 * A dropdown list of actions to perform on an applicant/grid item.
 */
export function GridItemDropdown({
    match,
    applicantSummary,
    setShownApplication,
    setShowChangeHours,
}: {
    match: MatchableAssignment;
    applicantSummary: ApplicantSummary;
    setShownApplication: (arg0: Application | null) => void;
    setShowChangeHours: (arg0: boolean) => void;
}) {
    const dispatch = useThunkDispatch();
    const baseMatchValues = React.useMemo(() => {
        return {
            positionCode: match.position.position_code,
            utorid: match.applicant.utorid,
        };
    }, [match]);

    const canBeAssigned =
        match.status === "hidden" ||
        match.status === "applied" ||
        match.status === "starred";

    const canBeHidden =
        match.status !== "assigned" && match.status !== "unassignable" && match.status !== "hidden";

    const assignToPosition = React.useCallback(() => {
        dispatch(
            upsertMatch({
                ...baseMatchValues,
                stagedAssigned: true,
                stagedHoursAssigned: match.position.hours_per_assignment || 0,
            })
        );
    }, [baseMatchValues, match, dispatch]);

    const unassignFromPosition = React.useCallback(() => {
        dispatch(
            upsertMatch({
                ...baseMatchValues,
                stagedAssigned: false,
                stagedHoursAssigned: 0,
            })
        );
    }, [baseMatchValues, dispatch]);

    const hideFromPosition = React.useCallback(() => {
        dispatch(upsertMatch({ ...baseMatchValues, hidden: true }));
    }, [baseMatchValues, dispatch]);

    const unhideFromPosition = React.useCallback(() => {
        dispatch(upsertMatch({ ...baseMatchValues, hidden: false }));
    }, [baseMatchValues, dispatch]);

    const hideFromAll = React.useCallback(() => {
        for (const targetMatch of applicantSummary.matches) {
            dispatch(
                upsertMatch({
                    utorid: match.applicant.utorid,
                    positionCode: targetMatch.position.position_code,
                    hidden: true,
                })
            );
        }
    }, [dispatch, match, applicantSummary.matches]);

    const unhideFromAll = React.useCallback(() => {
        for (const targetMatch of applicantSummary.matches) {
            dispatch(
                upsertMatch({
                    utorid: match.applicant.utorid,
                    positionCode: targetMatch.position.position_code,
                    hidden: false,
                })
            );
        }
    }, [dispatch, match, applicantSummary.matches]);

    return (
        <>
            <Dropdown.Item
                onClick={() =>
                    setShownApplication(applicantSummary.application)
                }
            >
                View application details
            </Dropdown.Item>
            {canBeAssigned && (
                <Dropdown.Item onClick={assignToPosition}>
                    Assign to <b>{match.position.position_code}</b> (
                    {match.position.hours_per_assignment || 0})
                </Dropdown.Item>
            )}
            {match.status === "staged-assigned" && (
                <>
                    <Dropdown.Item onClick={() => setShowChangeHours(true)}>
                        Change assigned hours
                    </Dropdown.Item>
                    <Dropdown.Item onClick={unassignFromPosition}>
                        Unassign from <b>{match.position.position_code}</b>
                    </Dropdown.Item>
                </>
            )}
            {canBeHidden && (
                <Dropdown.Item onClick={hideFromPosition}>
                    Hide from <b>{match.position.position_code}</b>
                </Dropdown.Item>
            )}

            {canBeAssigned && (
                <Dropdown.Item onClick={hideFromAll}>
                    Hide from all courses
                </Dropdown.Item>
            )}
            {match.status === "hidden" && (
                <>
                    <Dropdown.Item onClick={unhideFromPosition}>
                        Unhide from <b>{match.position.position_code}</b>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={unhideFromAll}>
                        Unhide from all courses
                    </Dropdown.Item>
                </>
            )}
        </>
    );
}
