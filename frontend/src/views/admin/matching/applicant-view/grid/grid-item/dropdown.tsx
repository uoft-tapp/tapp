import React from "react";
import { ApplicantSummary, MatchableAssignment } from "../../../types";
import { Application } from "../../../../../../api/defs/types";
import { Dropdown } from "react-bootstrap";
import {
    useAssignApplicantToPosition,
    useUnassignApplicantFromPosition,
    useToggleStarred,
    SetHiddenFromAllPositions,
    SetHiddenFromPosition,
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
    setShownApplication: (arg0: Application | null) => void;
    setShowChangeHours: (arg0: boolean) => void;
    setShowNote: (arg0: boolean) => void;
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
        match.status !== "assigned" && match.status !== "hidden";

    const canBeStarred =
        match.status !== "assigned" && match.status !== "starred";

    const canBeUnstarred = match.status === "starred";

    const assignApplicant = useAssignApplicantToPosition(
        baseMatchValues.positionCode,
        baseMatchValues.utorid,
        match.position.hours_per_assignment || 0
    );

    const unassignApplicant = useUnassignApplicantFromPosition(
        baseMatchValues.positionCode,
        baseMatchValues.utorid
    );

    const toggleStar = useToggleStarred(
        match.position.position_code,
        match.applicant.utorid
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

            {canBeAssigned && (
                <Dropdown.Item onClick={assignApplicant}>
                    Assign to <b>{match.position.position_code}</b> (
                    {match.position.hours_per_assignment || 0})
                </Dropdown.Item>
            )}
            {match.status === "staged-assigned" && (
                <>
                    <Dropdown.Item onClick={() => setShowChangeHours(true)}>
                        Change assigned hours
                    </Dropdown.Item>
                    <Dropdown.Item onClick={unassignApplicant}>
                        Unassign from <b>{match.position.position_code}</b>
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
                <Dropdown.Item
                    onClick={SetHiddenFromPosition(
                        baseMatchValues.positionCode,
                        baseMatchValues.utorid,
                        true
                    )}
                >
                    Hide from <b>{match.position.position_code}</b>
                </Dropdown.Item>
            )}

            {canBeAssigned && (
                <Dropdown.Item
                    onClick={SetHiddenFromAllPositions(applicantSummary, true)}
                >
                    Hide from all courses
                </Dropdown.Item>
            )}
            {match.status === "hidden" && (
                <>
                    <Dropdown.Item
                        onClick={SetHiddenFromPosition(
                            baseMatchValues.positionCode,
                            baseMatchValues.utorid,
                            false
                        )}
                    >
                        Unhide from <b>{match.position.position_code}</b>
                    </Dropdown.Item>
                    <Dropdown.Item
                        onClick={SetHiddenFromAllPositions(
                            applicantSummary,
                            false
                        )}
                    >
                        Unhide from all courses
                    </Dropdown.Item>
                </>
            )}
        </>
    );
}
