import React from "react";
import { ConnectedAddPositionDialog } from "./add-position-dialog";
import { Button } from "react-bootstrap";
import { ConnectedSessionSelect } from "../sessions";
import { ConnectedPositionsList } from "./position-list";

export function AdminPositionsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    return (
        <div>
            <ConnectedSessionSelect />
            <Button
                onClick={() => {
                    setAddDialogVisible(true);
                }}
            >
                Add Position
            </Button>
            <ConnectedAddPositionDialog
                show={addDialogVisible}
                onHide={() => {
                    setAddDialogVisible(false);
                }}
            />
            <ConnectedPositionsList />
        </div>
    );
}

export { ConnectedAddPositionDialog, ConnectedPositionsList };
