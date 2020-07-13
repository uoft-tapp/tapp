import React from "react";
import { ConnectedOfferTable } from "../offertable";
import { ConnectedAddAssignmentDialog } from "./add-assignment-dialog";
import { ConnectedViewAssignmentDetailsButton } from "./assignment-details";
import { ConnectedOfferActionButtons } from "./offer-actions";
import {
    ConnectedExportAssignmentsAction,
    ConnectedImportAssignmentsAction,
} from "./import-export";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../components/action-buttons";
import { ContentArea } from "../../components/layout";
import { FaPlus } from "react-icons/fa";

export function AdminAssignmentsView() {
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
                    Add Assignment
                </ActionButton>
                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedImportAssignmentsAction />
                <ConnectedExportAssignmentsAction />
                <ActionHeader>Selected Assignment Actions</ActionHeader>
                <ConnectedOfferActionButtons />
            </ActionsList>
            <ContentArea>
                <ConnectedViewAssignmentDetailsButton />

                <ConnectedOfferTable />
                <ConnectedAddAssignmentDialog
                    show={addDialogVisible}
                    onHide={() => {
                        setAddDialogVisible(false);
                    }}
                />
            </ContentArea>
        </div>
    );
}
