import React from "react";
import { ConnectedAddPositionDialog } from "./add-position-dialog";
import { Button } from "react-bootstrap";
import { ConnectedPositionsList } from "./position-list";
import {
    ConnectedExportPositionsAction,
    ConnectedImportPositionsAction,
} from "./import-export";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../components/action-buttons";
import { ContentArea } from "../../components/layout";
import { FaPlus } from "react-icons/fa";

export function AdminPositionsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Available actions</ActionHeader>
                <ActionButton
                    icon={<FaPlus />}
                    onClick={() => {
                        setAddDialogVisible(true);
                    }}
                >
                    Add Position
                </ActionButton>
                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedImportPositionsAction />
                <ConnectedExportPositionsAction />
            </ActionsList>
            <ContentArea>
                <ConnectedAddPositionDialog
                    show={addDialogVisible}
                    onHide={() => {
                        setAddDialogVisible(false);
                    }}
                />
                <ConnectedPositionsList />
            </ContentArea>
        </div>
    );
}

export { ConnectedAddPositionDialog, ConnectedPositionsList };
