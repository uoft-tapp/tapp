import React from "react";
import { ConnectedOfferTable } from "../offertable";
import { Button } from "react-bootstrap";
import { ConnectedAddAssignmentDialog } from "./add-assignment-dialog";

export function AdminAssignmentsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    return (
        <div>
            <Button
                onClick={() => {
                    setAddDialogVisible(true);
                }}
            >
                Add Assignment
            </Button>
            <ConnectedOfferTable />
            <ConnectedAddAssignmentDialog
                show={addDialogVisible}
                onHide={setAddDialogVisible}
            />
        </div>
    );
}
