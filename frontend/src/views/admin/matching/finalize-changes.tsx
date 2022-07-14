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
                    return (a.positionCode + " " + a.utorid).toLowerCase() <
                        ( b.positionCode + " " + b.utorid).toLowerCase()
                        ? -1
                        : 1;
                }) || null
        );
    }, [matchingData])

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
            const newAssignment = {
                position: positions.find(
                    (position) => position.id === match.positionId
                ),
                position_id: match.positionId,
                hours: match.hoursAssigned,
                applicant: applicants.find(
                    (applicant) =>
                        applicant.utorid === match.utorid &&
                        applicant.id === match.applicantId
                ),
                applicant_id: match.applicantId,
            };

            makeAssignment(newAssignment as Partial<Assignment>);
        }
    }

    return (
        <>
            <Button
                variant="outline-primary"
                size="sm"
                className="footer-button finalize"
                onClick={onClick}
                disabled={stagedAssignments && stagedAssignments.length === 0 ? true : false}
            >
                Finalize Changes { stagedAssignments && stagedAssignments.length > 0 ? " (" + stagedAssignments.length + ")" : "" }
            </Button>
            <Modal 
                show={showDialog}
                dialogClassName="finalize-changes-modal"
            >
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
                                        key={
                                            "" +
                                            match.positionCode +
                                            match.utorid
                                        }
                                    >
                                        {match.positionCode} - {match.utorid} ({match.hoursAssigned})
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
