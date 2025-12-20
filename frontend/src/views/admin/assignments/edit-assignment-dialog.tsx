import React from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import {
    AssignmentEditor,
    NullableAssignment,
} from "../../../components/forms/assignment-editor";
import { Assignment } from "../../../api/defs/types";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { upsertAssignment } from "../../../api/actions";

function generateNullableAssignment(
    assignment: Assignment
): NullableAssignment {
    return {
        ...assignment,
        position_id: assignment.position.id,
        applicant_id: assignment.applicant.id,
    };
}

export function EditAssignmentDialog({
    show,
    onHide,
    assignment,
    upsertAssignment,
}: {
    show: boolean;
    onHide: (...args: any[]) => void;
    assignment: Assignment;
    upsertAssignment: (assignment: Partial<Assignment>) => any;
}) {
    const [newAssignment, setNewAssignment] =
        React.useState<NullableAssignment>(() =>
            generateNullableAssignment(assignment)
        );
    const [inProgress, setInProgress] = React.useState(false);

    React.useEffect(() => {
        if (!show) {
            // If the dialog is hidden, reset the state
            setNewAssignment(generateNullableAssignment(assignment));
        }
    }, [show, assignment]);

    async function createAssignment() {
        setInProgress(true);
        try {
            const assignmentToUpsert = { ...newAssignment };
            // Special care must be taken to ensure that the wageChunks and the start/end
            // dates match up. If the dates have changed, we may need to create new wageChunks
            if (
                (assignmentToUpsert.start_date !== assignment.start_date ||
                    assignmentToUpsert.end_date !== assignment.end_date) &&
                !assignmentToUpsert.wage_chunks
            ) {
                assignmentToUpsert.wage_chunks = [
                    {
                        start_date: assignmentToUpsert.start_date,
                        end_date: assignmentToUpsert.end_date,
                        hours: assignmentToUpsert.hours,
                    },
                ];
            }
            await upsertAssignment(assignmentToUpsert as Partial<Assignment>);
        } finally {
            setInProgress(false);
        }
        onHide();
    }

    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="me-1" />
    ) : null;

    const conflicts: { immediateShow?: React.ReactNode } = {};

    if (
        ["rejected", "pending", "accepted"].includes(
            assignment.active_offer_status || ""
        )
    ) {
        conflicts.immediateShow = (
            <React.Fragment>
                This assignment currently has an active offer. You must first{" "}
                <b>withdraw</b> the existing offer before making a modification.
            </React.Fragment>
        );
    }

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Assignment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <AssignmentEditor
                    positions={[assignment.position]}
                    applicants={[assignment.applicant]}
                    assignment={newAssignment}
                    setAssignment={setNewAssignment}
                    lockPositionAndApplicant={true}
                />
                {!inProgress && conflicts.immediateShow ? (
                    <Alert variant="danger">{conflicts.immediateShow}</Alert>
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button
                    onClick={createAssignment}
                    title={"Modify Assignment"}
                    disabled={!!conflicts.immediateShow}
                >
                    {spinner}
                    Modify Assignment
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export function ConnectedEditAssignmentDialog({
    assignment,
    show,
    onHide,
}: {
    assignment: Assignment | null | undefined;
    show: boolean;
    onHide: (...args: any[]) => void;
}) {
    const dispatch = useThunkDispatch();
    const _upsertAssignment = React.useCallback(
        async (assignment: Partial<Assignment>) => {
            await dispatch(upsertAssignment(assignment));
        },
        [dispatch]
    );

    if (!assignment) {
        return null;
    }

    return (
        <EditAssignmentDialog
            show={show}
            onHide={onHide}
            assignment={assignment}
            upsertAssignment={_upsertAssignment}
        />
    );
}
