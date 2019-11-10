import React from "react";
import { ConnectedOfferTable } from "../offertable";
import { Button } from "react-bootstrap";
import { ConnectedAddAssignmentDialog } from "./add-assignment-dialog";
import { ConnectedViewAssignmentDetailsButton } from "./assignment-details";

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
            <ConnectedViewAssignmentDetailsButton />
        </div>
    );
}
