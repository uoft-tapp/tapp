import React from "react";
import { ConnectedSessionSelect } from "./session-select";
import { ConnectedAddSessionDialog } from "./add-session-dialog";
import { Button } from "react-bootstrap";

export function AdminSessionsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    return (
        <div>
            <Button
                onClick={() => {
                    setAddDialogVisible(true);
                }}
            >
                Add Session
            </Button>
            <ConnectedAddSessionDialog
                show={addDialogVisible}
                onHide={() => {
                    setAddDialogVisible(false);
                }}
            />
            <ConnectedSessionSelect />
        </div>
    );
}

export { ConnectedAddSessionDialog, ConnectedSessionSelect };
