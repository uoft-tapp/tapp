import React from "react";
import { connect } from "react-redux";
import { Modal, Alert, Button, Spinner } from "react-bootstrap";
import { strip } from "../../../libs/utils";
import {
    positionsSelector,
    applicantsSelector,
    assignmentsSelector,
    upsertAssignment,
} from "../../../api/actions";
import {
    AssignmentEditor,
    NullableAssignment,
} from "../../../components/forms/assignment-editor";
import {
    Applicant,
    Assignment,
    Position,
    RawAssignment,
} from "../../../api/defs/types";

function getConflicts(
    assignment: Partial<NullableAssignment>,
    assignments: Assignment[] = []
) {
    const ret: { delayShow: string; immediateShow: React.ReactNode } = {
        delayShow: "",
        immediateShow: "",
    };
    if (
        !strip((assignment as RawAssignment).position_id) ||
        !strip((assignment as RawAssignment).applicant_id)
    ) {
        ret.delayShow = "A position and applicant is required";
    }
    const matchingAssignment = assignments.find(
        (x) =>
            strip((x.position || {}).id) ===
                strip(((assignment as Assignment).position || {}).id) &&
            strip((x.applicant || {}).id) ===
                strip(((assignment as Assignment).applicant || {}).id)
    );
    if (matchingAssignment) {
        ret.immediateShow = (
            <p>
                Another assignment exists with{" "}
                <b>
                    applicant={(assignment as Assignment).applicant?.first_name}{" "}
                    {(assignment as Assignment).applicant?.last_name}
                </b>{" "}
                and{" "}
                <b>
                    position=
                    {(assignment as Assignment).position?.position_code}
                </b>
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
} as unknown as NullableAssignment;

export function AddAssignmentDialog(props: {
    show: boolean;
    onHide: (...args: any[]) => void;
    positions: Position[];
    applicants: Applicant[];
    assignments: Assignment[];
    upsertAssignment: (assignment: Partial<Assignment>) => any;
}) {
    const {
        show,
        onHide,
        positions,
        applicants,
        assignments,
        upsertAssignment,
    } = props;
    const [newAssignment, setNewAssignment] =
        React.useState<NullableAssignment>(
            BLANK_ASSIGNMENT as NullableAssignment
        );
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
            await upsertAssignment(newAssignment as Partial<Assignment>);
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
