import React from "react";
import { connect } from "react-redux";
import { deleteInstructor, instructorsSelector } from "../../api/actions";
import { Modal, Button } from "react-bootstrap";

function DeleteInstructorDialog(props) {
    const { show, onHide = () => {}, id, deleteInstructor } = props;
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
                Press OK to confirm deleting this instructor.
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="secondary">
                    Cancel
                </Button>
                <Button onClick={removeInstructor}>OK</Button>
            </Modal.Footer>
        </Modal>
    );
}

export const ConnectedDeleteInstructorDialog = connect(
    (state) => ({
        instructors: instructorsSelector(state),
    }),
    {
        deleteInstructor,
    }
)(DeleteInstructorDialog);
