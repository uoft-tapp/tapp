import React from "react";
import { ConnectedAddSessionDialog } from "./add-session-dialog";
import { SessionsList } from "../../components/sessions";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../components/action-buttons";
import { ContentArea } from "../../components/layout";
import { FaPlus } from "react-icons/fa";

export function AdminSessionsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
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
                <ConnectedAddSessionDialog
                    show={addDialogVisible}
                    onHide={() => {
                        setAddDialogVisible(false);
                    }}
                />
                <SessionsList />
            </ContentArea>
        </div>
    );
}

export { ConnectedAddSessionDialog };
