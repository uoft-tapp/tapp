import React from "react";
import { Button } from "react-bootstrap";
import { ConnectedAddContractTemplateDialog } from "./contract-template-dialog";
import { ConnectedContractTemplateList } from "./contract-template-list";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../components/action-buttons";
import { ContentArea } from "../../components/layout";
import { FaPlusCircle } from "react-icons/fa";

export function AdminContractTemplatesView() {
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
                    Add Contract Template
                </ActionButton>
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
