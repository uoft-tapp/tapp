import React from "react";
import { ApplicantSummary, MatchableAssignment } from "../../../types";
import { Application } from "../../../../../../api/defs/types";
import { Dropdown } from "react-bootstrap";
import {
    useToggleAssigned,
    useToggleStarred,
    useHideFromAllPositions,
    useHideFromPosition,
} from "../../../match-actions/modify-match-status";

/**
 * A dropdown list of actions to perform on an applicant/grid item.
 */
export function GridItemDropdown({
    match,
    applicantSummary,
    setShownApplication,
    setShowChangeHours,
    setShowNote,
}: {
    match: MatchableAssignment;
    applicantSummary: ApplicantSummary;
    setShownApplication: (shownApplication: Application | null) => void;
    setShowChangeHours: (show: boolean) => void;
    setShowNote: (show: boolean) => void;
}) {
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
        match.status !== "assigned" &&
        match.status !== "staged-assigned" &&
        match.status !== "unassignable" &&
        match.status !== "hidden";

    const canBeStarred =
        match.status !== "assigned" &&
        match.status !== "staged-assigned" &&
        match.status !== "starred";

    const canBeUnstarred = match.status === "starred";

    const toggleAssign = useToggleAssigned(
        baseMatchValues.positionCode,
        baseMatchValues.utorid,
        match.position.hours_per_assignment || 0
    );

    const toggleStar = useToggleStarred(
        match.position.position_code,
        match.applicant.utorid
    );

    const hideFromAllPositions = useHideFromAllPositions(
        applicantSummary,
        true
    );

    const hideFromPosition = useHideFromPosition(
        baseMatchValues.positionCode,
        baseMatchValues.utorid,
        true
    );

    const unhideFromAllPositions = useHideFromAllPositions(
        applicantSummary,
        false
    );

    const unhideFromPosition = useHideFromPosition(
        baseMatchValues.positionCode,
        baseMatchValues.utorid,
        false
    );

    return (
        <>
            <Dropdown.Item
                onClick={() =>
                    setShownApplication(applicantSummary.application)
                }
            >
                View application details
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setShowNote(true)}>
                View/edit applicant notes
            </Dropdown.Item>

            {match.status === "staged-assigned" && (
                <>
                    <Dropdown.Item onClick={() => setShowChangeHours(true)}>
                        Change assigned hours
                    </Dropdown.Item>
                </>
            )}
            {(canBeAssigned || match.status === "staged-assigned") && (
                <>
                    <Dropdown.Item onClick={toggleAssign}>
                        {canBeAssigned ? "Assign to " : "Unassign from "}
                        <b>{match.position.position_code}</b>
                        {canBeAssigned
                            ? ` (${match.position.hours_per_assignment || 0})`
                            : ""}
                    </Dropdown.Item>
                </>
            )}
            {(canBeStarred || canBeUnstarred) && (
                <Dropdown.Item onClick={toggleStar}>
                    {canBeStarred ? "Star for " : "Unstar from "}
                    <b>{match.position.position_code}</b>
                </Dropdown.Item>
            )}
            {canBeHidden && (
                <Dropdown.Item onClick={hideFromPosition}>
                    Hide from <b>{match.position.position_code}</b>
                </Dropdown.Item>
            )}
            {canBeAssigned && (
                <Dropdown.Item onClick={hideFromAllPositions}>
                    Hide from all courses
                </Dropdown.Item>
            )}
            {match.status === "hidden" && (
                <>
                    <Dropdown.Item onClick={unhideFromPosition}>
                        Unhide from <b>{match.position.position_code}</b>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={unhideFromAllPositions}>
                        Unhide from all courses
                    </Dropdown.Item>
                </>
            )}
        </>
    );
}
