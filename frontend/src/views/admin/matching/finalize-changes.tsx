import React from "react";
import { matchingDataSelector } from "./actions";
import { useSelector } from "react-redux";
import { Modal, Button } from "react-bootstrap";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { Match } from "./types";

import { Assignment } from "../../../api/defs/types";

import {
    positionsSelector,
    applicantsSelector,
    upsertAssignment,
} from "../../../api/actions";

/**
 * A button that brings up a modal allowing users to see a list of staged assignments
 * and transform them into real assignments.
 *
 * @param {*} props
 * @returns
 */
export function FinalizeChangesButton() {
    const [showDialog, setShowDialog] = React.useState(false);
    const [stagedAssignments, setStagedAssignments] = React.useState<
        Match[] | null
    >(null);
    const matchingData = useSelector(matchingDataSelector);
    const positions = useSelector(positionsSelector);
    const applicants = useSelector(applicantsSelector);

    const dispatch = useThunkDispatch();

    React.useEffect(() => {
        setStagedAssignments(
            matchingData.matches
                .filter((match) => match.status === "staged-assigned")
                .sort((a, b) => {
                    return `${a.positionCode} ${a.utorid}`.toLowerCase() <
                        `${b.positionCode} ${b.utorid}`.toLowerCase()
                        ? -1
                        : 1;
                }) || null
        );
    }, [matchingData]);

    function onClick() {
        setShowDialog(true);
    }

    async function makeAssignment(assignment: Partial<Assignment>) {
        await dispatch(upsertAssignment(assignment));
    }

    function _onConfirm() {
        setShowDialog(false);

        if (!stagedAssignments) {
            return;
        }

        for (const match of stagedAssignments) {
            const targetPosition = positions.find(
                (position) => position.position_code === match.positionCode
            );
            const targetApplicant = applicants.find(
                (applicant) => applicant.utorid === match.utorid
            );

            if (!targetPosition || !targetApplicant) {
                return;
            }

            const newAssignment: Partial<Assignment> = {
                position: targetPosition,
                hours: match.hoursAssigned,
                applicant: targetApplicant,
            };

            makeAssignment(newAssignment);
        }
    }

    return (
        <>
            <Button
                variant="outline-primary"
                size="sm"
                className="footer-button finalize"
                onClick={onClick}
                disabled={
                    stagedAssignments && stagedAssignments.length === 0
                        ? true
                        : false
                }
            >
                Finalize Changes{" "}
                {stagedAssignments && stagedAssignments.length > 0
                    ? ` (${stagedAssignments.length})`
                    : ""}
            </Button>
            <Modal show={showDialog} dialogClassName="finalize-changes-modal">
                <Modal.Header>
                    <Modal.Title>Finalize Changes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    The following assignments will be made:
                    {stagedAssignments && stagedAssignments.length > 0 ? (
                        <ul>
                            {stagedAssignments.map((match) => {
                                return (
                                    <li
                                        key={`${match.positionCode} ${match.utorid}`}
                                    >
                                        {match.positionCode} - {match.utorid} (
                                        {match.hoursAssigned})
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        "N/A"
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => setShowDialog(false)}
                        variant="light"
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={_onConfirm}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
