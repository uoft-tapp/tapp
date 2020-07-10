import React from "react";
import { connect } from "react-redux";
import { deleteInstructor, instructorsSelector } from "../../api/actions";
import { Modal, Button } from "react-bootstrap";

function DeleteInstructorDialog(props) {
    const { show, onHide, deleteInstructor, instructorToDelete } = props;
    const { first_name, last_name, id } = instructorToDelete;

    function removeInstructor() {
        deleteInstructor({ id });
        onHide();
    }

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Instructor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete instructor{" "}
                {`${last_name}, ${first_name}`}? This action cannot be undone.
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
    (state) => ({ instructors: instructorsSelector(state) }), // don't need instructors anymore?
    { deleteInstructor }
)(DeleteInstructorDialog);
