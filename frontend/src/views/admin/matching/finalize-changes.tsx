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
    const [dialogVisible, setDialogVisible] = React.useState(false);

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

    function _onConfirm() {
        if (stagedAssignments.length === 0) {
            setDialogVisible(false);
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
        setDialogVisible(false);
    }

    return (
        <>
            <Button
                variant="outline-primary"
                size="sm"
                className="footer-button finalize"
                onClick={() => setDialogVisible(true)}
                disabled={stagedAssignments.length === 0}
            >
                Finalize Changes{" "}
                {stagedAssignments.length > 0
                    ? ` (${stagedAssignments.length})`
                    : ""}
            </Button>
            <Modal
                show={dialogVisible}
                dialogClassName="finalize-changes-modal"
                onHide={() => setDialogVisible(false)}
            >
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
                        onClick={() => setDialogVisible(false)}
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
