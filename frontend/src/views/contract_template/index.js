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

export function AdminContractTemplatesView() {
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
                    Add Contract Template
                </ActionButton>
                <ConnectedUploadContractTemplateAction />
            </ActionsList>
            <ContentArea>
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
