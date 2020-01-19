import React from "react";
import { connect } from "react-redux";
import { ConnectedAddSessionDialog } from "./add-session-dialog";
import { Button } from "react-bootstrap";
import { sessionsSelector } from "../../api/actions";
import { SessionsList } from "../../components/sessions";

const ConnectedSessionList = connect(state => ({
    sessions: sessionsSelector(state)
}))(SessionsList);

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
            <ConnectedSessionList />
        </div>
    );
}

export { ConnectedAddSessionDialog };
