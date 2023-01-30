import React from "react";
import { ApplicantSummary, MatchableAssignment } from "../../../types";
import { Application } from "../../../../../../api/defs/types";
import { Dropdown } from "react-bootstrap";
import {
    useToggleAssigned,
    useToggleStarred,
    useHideFromAllPositions,
    useToggleHidden,
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
        match.status !== "hidden";

    const canBeStarred =
        match.status !== "assigned" &&
        match.status !== "staged-assigned" &&
        match.status !== "starred";

    const canBeUnstarred = match.status === "starred";

    const toggleAssigned = useToggleAssigned(
        baseMatchValues.positionCode,
        baseMatchValues.utorid,
        match.position.hours_per_assignment || 0
    );

    const toggleStarred = useToggleStarred(
        match.position.position_code,
        match.applicant.utorid
    );

    const toggleHidden = useToggleHidden(
        baseMatchValues.positionCode,
        baseMatchValues.utorid
    );

    const hideFromAllPositions = useHideFromAllPositions({
        applicantSummary: applicantSummary,
        hide: true,
    });

    const unhideFromAllPositions = useHideFromAllPositions({
        applicantSummary: applicantSummary,
        hide: false,
    });

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
                    <Dropdown.Item onClick={toggleAssigned}>
                        {canBeAssigned ? "Assign to " : "Unassign from "}
                        <b>{match.position.position_code}</b>
                        {canBeAssigned
                            ? ` (${match.position.hours_per_assignment || 0})`
                            : ""}
                    </Dropdown.Item>
                </>
            )}
            {(canBeStarred || canBeUnstarred) && (
                <Dropdown.Item onClick={toggleStarred}>
                    {canBeStarred ? "Star for " : "Unstar from "}
                    <b>{match.position.position_code}</b>
                </Dropdown.Item>
            )}
            {canBeHidden && (
                <>
                    <Dropdown.Item onClick={toggleHidden}>
                        Hide from <b>{match.position.position_code}</b>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={hideFromAllPositions}>
                        Hide from all courses
                    </Dropdown.Item>
                </>
            )}
            {match.status === "hidden" && (
                <>
                    <Dropdown.Item onClick={toggleHidden}>
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
