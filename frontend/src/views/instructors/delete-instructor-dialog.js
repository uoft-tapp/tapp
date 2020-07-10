import React from "react";
import { connect } from "react-redux";
import { deleteInstructor, instructorsSelector } from "../../api/actions";
import { Modal, Button } from "react-bootstrap";

const BLANK_INSTRUCTOR = {
    first_name: "",
    last_name: "",
    email: "",
    utorid: "",
    id: 0,
};

function DeleteInstructorDialog(props) {
    const {
        show,
        onHide,
        instructors,
        deleteInstructor: apiDeleteInstructor,
    } = props; // terrible name, use to prevent shadowing
    const [deleteInstructor, setDeleteInstructor] = React.useState(
        BLANK_INSTRUCTOR
    );

    React.useEffect(() => {
        if (!show) {
            setDeleteInstructor(BLANK_INSTRUCTOR);
        }
    }, [show]);

    function removeInstructor() {
        deleteInstructor(deleteInstructor.id);
        onHide();
    }

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Instructor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete instructor{" "}
                {`${deleteInstructor.last_name}, ${deleteInstructor.first_name}`}{" "}
                ?
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button onClick={removeInstructor} title="Delete Instructor">
                    OK
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export const ConnectedDeleteInstructorDialog = connect(
    (state) => ({ instructors: instructorsSelector(state) }),
    { deleteInstructor }
)(DeleteInstructorDialog);
