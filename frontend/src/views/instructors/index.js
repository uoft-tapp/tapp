import React from "react";
import { ConnectedInstructorsList } from "./editable-instructors-list";
import { ConnectedAddInstructorDialog } from "./add-instructor-dialog";
import { Button } from "react-bootstrap";

export function AdminIstructorsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
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
            <ConnectedInstructorsList />
        </div>
    );
}

export { ConnectedInstructorsList, ConnectedAddInstructorDialog };
