import React from "react";
import { matchesSelector } from "./actions";
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
 */
export function FinalizeChangesButton() {
    const [showDialog, setShowDialog] = React.useState(false);

    const matches = useSelector(matchesSelector);
    const positions = useSelector(positionsSelector);
    const applicants = useSelector(applicantsSelector);

    const dispatch = useThunkDispatch();

    const stagedAssignments: Match[] = React.useMemo(() => {
        return matches
            .filter((match) => match.status === "staged-assigned")
            .sort((a, b) => {
                return `${a.positionCode} ${a.utorid}`.toLowerCase() <
                    `${b.positionCode} ${b.utorid}`.toLowerCase()
                    ? -1
                    : 1;
            });
    }, [matches]);

    function onClick() {
        setShowDialog(true);
    }

    function _onConfirm() {
        setShowDialog(false);

        if (stagedAssignments.length === 0) {
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

            dispatch(upsertAssignment(newAssignment));
        }
    }

    return (
        <>
            <Button
                variant="outline-primary"
                size="sm"
                className="footer-button finalize"
                onClick={onClick}
                disabled={stagedAssignments.length === 0}
            >
                Finalize Changes{" "}
                {stagedAssignments.length > 0
                    ? ` (${stagedAssignments.length})`
                    : ""}
            </Button>
            <Modal show={showDialog} dialogClassName="finalize-changes-modal">
                <Modal.Header>
                    <Modal.Title>Finalize Changes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    The following assignments will be made:
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
