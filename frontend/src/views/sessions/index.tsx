import React from "react";
import { useSelector } from "react-redux";
import { ConnectedAddSessionDialog } from "./add-session-dialog";
import { activeSessionSelector } from "../../api/actions";
import { SessionsList as ConnectedSessionsList } from "../../components/sessions";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../components/action-buttons";
import { ContentArea } from "../../components/layout";
import { FaPlus } from "react-icons/fa";
import { Session } from "../../api/defs/types";

export function AdminSessionsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);

    const activeSession = useSelector(activeSessionSelector) as Session | null;

    let activeSessionInfo = (
        <>
            There is currently <b className="text-primary">no active session</b>{" "}
            selected. In order to setup contract templates or create positions
            and offers, you must select an active session.
        </>
    );
    if (activeSession) {
        activeSessionInfo = (
            <>
                The current active session is{" "}
                <b className="text-primary">{activeSession.name}</b>. When
                setting up contract templates or creating positions and offers,
                they will be attached to the <i>{activeSession.name}</i>{" "}
                session.
            </>
        );
    }

    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Available Actions</ActionHeader>
                <ActionButton
                    icon={<FaPlus />}
                    onClick={() => {
                        setAddDialogVisible(true);
                    }}
                >
                    Add Session
                </ActionButton>
            </ActionsList>
            <ContentArea>
                <h3>Session Management and Creation</h3>
                <p>
                    From this page, you can manage an existing session or create
                    a new session.
                </p>
                <p>{activeSessionInfo}</p>

                <h5>Existing Sessions</h5>
                <ConnectedAddSessionDialog
                    show={addDialogVisible}
                    onHide={() => {
                        setAddDialogVisible(false);
                    }}
                />
                <ConnectedSessionsList />
            </ContentArea>
        </div>
    );
}

export { ConnectedAddSessionDialog };
