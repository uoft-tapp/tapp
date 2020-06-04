import React from "react";
import { strip } from "../../libs/utils";
import { connect } from "react-redux";
import { SessionEditor } from "../../components/forms/session-editor";
import { upsertSession, sessionsSelector } from "../../api/actions";
import { Modal, Button, Alert } from "react-bootstrap";

function getConficts(session, sessions = []) {
    const ret = { delayShow: "", immediateShow: "" };
    if (
        !strip(session.name) ||
        !strip(session.start_date) ||
        !strip(session.end_date)
    ) {
        ret.delayShow = "A first name, start date, and end date is required";
    }
    const matchingSession = sessions.find(
        (x) => strip(x.name) === strip(session.name)
    );
    if (matchingSession) {
        ret.immediateShow = (
            <p>Another session exists with name={session.name}</p>
        );
    }
    return ret;
}

const BLANK_SESSION = {
    name: "",
    start_date: "",
    end_date: "",
    rate1: "",
    rate2: "",
};

export function AddSessionDialog(props) {
    const { show, onHide = () => {}, sessions, upsertSession } = props;
    const [newSession, setNewSession] = React.useState(BLANK_SESSION);

    React.useEffect(() => {
        if (!show) {
            // If the dialog is hidden, reset the state
            setNewSession(BLANK_SESSION);
        }
    }, [show]);

    function createInstructor() {
        upsertSession(newSession);
        onHide();
    }

    const conflicts = getConficts(newSession, sessions);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add Session</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <SessionEditor
                    session={newSession}
                    setSession={setNewSession}
                />
                {conflicts.immediateShow ? (
                    <Alert variant="danger">{conflicts.immediateShow}</Alert>
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button
                    onClick={createInstructor}
                    title={conflicts.delayShow || "Create Session"}
                    disabled={
                        !!conflicts.delayShow || !!conflicts.immediateShow
                    }
                >
                    Create Session
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export const ConnectedAddSessionDialog = connect(
    (state) => ({ sessions: sessionsSelector(state) }),
    { upsertSession }
)(AddSessionDialog);
