import React from "react";
import { ConnectedInstructorsList } from "./editable-instructors-list";
import { ConnectedAddInstructorDialog } from "./add-instructor-dialog";
import { ConnectedDeleteInstructorDialog } from "./delete-instructor-dialog";
import { Button } from "react-bootstrap";

export function AdminInstructorsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false);
    const [deleteInstructorId, setDeleteInstructorId] = React.useState(0);
    return (
        <div>
            <Button
                onClick={() => {
                    setAddDialogVisible(true);
                }}
            >
                Add Instructor
            </Button>
            <ConnectedAddInstructorDialog
                show={addDialogVisible}
                onHide={() => {
                    setAddDialogVisible(false);
                }}
            />
            <ConnectedInstructorsList
                deleteOnClick={() => {
                    setDeleteDialogVisible(true);
                }}
                setDeleteInstructorId={(id) => setDeleteInstructorId(id)}
            />
            <ConnectedDeleteInstructorDialog
                show={deleteDialogVisible}
                id={deleteInstructorId}
                onHide={() => {
                    setDeleteDialogVisible(false);
                }}
            />
        </div>
    );
}

export {
    ConnectedInstructorsList,
    ConnectedAddInstructorDialog,
    ConnectedDeleteInstructorDialog,
};
