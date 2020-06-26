import React from "react";
import { ConnectedInstructorsList } from "./editable-instructors-list";
import { ConnectedAddInstructorDialog } from "./add-instructor-dialog";
import { Button } from "react-bootstrap";
import { ConnectedExportInstructorsButton } from "./import-export";


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
            <ConnectedExportInstructorsButton />
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
