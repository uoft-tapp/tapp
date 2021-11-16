import React from "react";
import { Modal, Button } from "react-bootstrap";
import { Instructor } from "../../../api/defs/types";

export function DeleteInstructorDialog(props: {
    show: boolean;
    onHide: (...args: any[]) => void;
    onDelete: (...args: any[]) => any;
    instructor: Instructor | null;
}) {
    const { show, onHide, onDelete, instructor } = props;
    if (!instructor) {
        // This check ensures that the instructor object exists before trying to access instructor.last_name
        // and instructor.first_name, which will cause a runtime error if instructor is null.
        return null;
    } else {
        return (
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Instructor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete instructor{" "}
                    {instructor.last_name}, {instructor.first_name}? This action
                    cannot be undone.
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
}
