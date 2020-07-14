import React from "react";
import { Modal, Button } from "react-bootstrap";

export function DeleteInstructorDialog(props) {
    const { show, onHide, onDelete, instructor } = props;
    return !instructor ? null : ( // needed to catch the error of null instructor
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Instructor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete instructor{" "}
                {`${instructor.last_name}, ${instructor.first_name}`}? This
                action cannot be undone.
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button onClick={onDelete} title="Delete Instructor">
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
