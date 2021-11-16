import React from "react";
import { connect } from "react-redux";
import { InstructorEditor } from "../../../components/instructors";
import { Modal, Button, Alert } from "react-bootstrap";
import { upsertInstructor, instructorsSelector } from "../../../api/actions";
import { strip } from "../../../libs/utils";
import { Instructor } from "../../../api/defs/types";

const BLANK_INSTRUCTOR = {
    first_name: "",
    last_name: "",
    email: "",
    utorid: "",
};

/**
 * Find if there is a conflicting instructor in the passed in list
 * of instructors, or if any required fields are incorrect.
 *
 * @param {object} instructor
 * @param {object[]} instructors
 */
function getConflicts(
    instructor: Partial<Instructor>,
    instructors: Instructor[]
) {
    const ret: { delayShow: string; immediateShow: React.ReactNode } = {
        delayShow: "",
        immediateShow: "",
    };
    if (
        !strip(instructor.utorid) ||
        !strip(instructor.first_name) ||
        !strip(instructor.last_name)
    ) {
        ret.delayShow = "A first name, last name, and utorid is required";
    }
    const matchingInstructor = instructors.find(
        (x) => strip(x.utorid) === strip(instructor.utorid)
    );
    if (matchingInstructor) {
        ret.immediateShow = (
            <p>
                Another instructor exists with utorid={instructor.utorid}:{" "}
                <b>
                    {matchingInstructor.first_name}{" "}
                    {matchingInstructor.last_name}
                </b>
            </p>
        );
    }
    return ret;
}

function AddInstructorDialog(props: {
    show: boolean;
    onHide: (...args: any[]) => void;
    instructors: Instructor[];
    upsertInstructor: (instructor: Partial<Instructor>) => any;
}) {
    const { show, onHide = () => {}, instructors, upsertInstructor } = props;
    const [newInstructor, setNewInstructor] =
        React.useState<Partial<Instructor>>(BLANK_INSTRUCTOR);

    React.useEffect(() => {
        if (!show) {
            // If the dialog is hidden, reset the state
            setNewInstructor(BLANK_INSTRUCTOR);
        }
    }, [show]);

    function createInstructor() {
        upsertInstructor(newInstructor);
        onHide();
    }

    const conflicts = getConflicts(newInstructor, instructors);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add Instructor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InstructorEditor
                    instructor={newInstructor}
                    setInstructor={setNewInstructor}
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
                    onClick={createInstructor}
                    title={conflicts.delayShow || "Create Instructor"}
                    disabled={
                        !!conflicts.delayShow || !!conflicts.immediateShow
                    }
                >
                    Create Instructor
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
/**
 * AddInstructorDialog that has been connected to the redux store
 */
export const ConnectedAddInstructorDialog = connect(
    (state) => ({ instructors: instructorsSelector(state) }),
    { upsertInstructor }
)(AddInstructorDialog);
