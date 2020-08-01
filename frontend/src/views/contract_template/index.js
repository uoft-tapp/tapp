import React from "react";
import { ConnectedAddContractTemplateDialog } from "./contract-template-dialog";
import { ConnectedContractTemplateList } from "./contract-template-list";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../components/action-buttons";
import { ContentArea } from "../../components/layout";
import { FaPlus } from "react-icons/fa";
import { ConnectedUploadContractTemplateAction } from "./upload-contract-template-button";
import { useSelector } from "react-redux";
import { activeSessionSelector } from "../../api/actions";
import { MissingActiveSessionWarning } from "../../components/sessions";

export function AdminContractTemplatesView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    const activeSession = useSelector(activeSessionSelector);
    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Available Actions</ActionHeader>
                <ActionButton
                    icon={<FaPlus />}
                    onClick={() => {
                        setAddDialogVisible(true);
                    }}
                    disabled={!activeSession}
                >
                    Add Contract Template
                </ActionButton>
                <ConnectedUploadContractTemplateAction
                    disabled={!activeSession}
                />
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view or modify contract templates, you must select a session." />
                )}
                <ConnectedContractTemplateList />
                <ConnectedAddContractTemplateDialog
                    show={addDialogVisible}
                    onHide={() => {
                        setAddDialogVisible(false);
                    }}
                />
            </ContentArea>
        </div>
    );
}
