import React from "react";
import { ConnectedAddSessionDialog } from "./add-session-dialog";
import { ConnectedSessionsList } from "../../components/sessions";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../components/action-buttons";
import { ContentArea } from "../../components/layout";
import { FaPlusCircle } from "react-icons/fa";

export function AdminSessionsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Available Actions</ActionHeader>
                <ActionButton
                    icon={<FaPlusCircle />}
                    onClick={() => {
                        setAddDialogVisible(true);
                    }}
                >
                    Add Session
                </ActionButton>
            </ActionsList>
            <ContentArea>
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
