import React from "react";
import { Button } from "react-bootstrap";
import { ConnectedAddContractTemplateDialog } from "./contract-template-dialog";
import { ConnectedContractTemplateList } from "./contract-template-list";

export function AdminContractTemplatesView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    return (
        <div>
            <Button
                onClick={() => {
                    setAddDialogVisible(true);
                }}
            >
                Add Contract Template
            </Button>
            <ConnectedContractTemplateList />
            <ConnectedAddContractTemplateDialog
                show={addDialogVisible}
                onHide={setAddDialogVisible}
            />
        </div>
    );
}
