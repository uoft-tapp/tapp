import React from "react";
import { connect } from "react-redux";
import { Modal, Alert, Button, Spinner } from "react-bootstrap";
import { strip } from "../../libs/utils";
import {
    positionsSelector,
    applicantsSelector,
    assignmentsSelector,
    upsertAssignment,
} from "../../api/actions";
import { AssignmentEditor } from "../../components/forms/assignment-editor";

function getConflicts(assignment, assignments = []) {
    const ret = { delayShow: "", immediateShow: "" };
    if (!strip(assignment.position_id) || !strip(assignment.applicant_id)) {
        ret.delayShow = "A position and applicant is required";
    }
    const matchingAssignment = assignments.find(
        (x) =>
            strip((x.position || {}).id) ===
                strip((assignment.position || {}).id) &&
            strip((x.applicant || {}).id) ===
                strip((assignment.applicant || {}).id)
    );
    if (matchingAssignment) {
        ret.immediateShow = (
            <p>
                Another assignment exists with{" "}
                <b>
                    applicant={assignment.applicant.first_name}{" "}
                    {assignment.applicant.last_name}
                </b>{" "}
                and <b>position={assignment.position.position_code}</b>
            </p>
        );
    }
    return ret;
}

const BLANK_ASSIGNMENT = {
    position: { id: null },
    applicant: { id: null },
    position_id: -1,
    applicant_id: -1,
};

export function AddAssignmentDialog(props) {
    const {
        show,
        onHide,
        positions,
        applicants,
        assignments,
        upsertAssignment,
    } = props;
    const [newAssignment, setNewAssignment] = React.useState(BLANK_ASSIGNMENT);
    const [inProgress, setInProgress] = React.useState(false);

    React.useEffect(() => {
        if (!show) {
            // If the dialog is hidden, reset the state
            setNewAssignment(BLANK_ASSIGNMENT);
        }
    }, [show]);

    async function createAssignment() {
        setInProgress(true);
        try {
            await upsertAssignment(newAssignment);
        } finally {
            setInProgress(false);
        }
        onHide();
    }

    const conflicts = getConflicts(newAssignment, assignments);

    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="mr-1" />
    ) : null;

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add Assignment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <AssignmentEditor
                    positions={positions}
                    applicants={applicants}
                    assignment={newAssignment}
                    setAssignment={setNewAssignment}
                />
                {conflicts.immediateShow ? (
                    <Alert variant="danger">{conflicts.immediateShow}</Alert>
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button
                    onClick={createAssignment}
                    title={conflicts.delayShow || "Create Position"}
                    disabled={
                        !!conflicts.delayShow || !!conflicts.immediateShow
                    }
                >
                    {spinner}
                    Create Assignment
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export const ConnectedAddAssignmentDialog = connect(
    (state) => ({
        positions: positionsSelector(state),
        applicants: applicantsSelector(state),
        assignments: assignmentsSelector(state),
    }),
    { upsertAssignment }
)(AddAssignmentDialog);
