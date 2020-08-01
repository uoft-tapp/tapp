import React from "react";
import { ConnectedOfferTable } from "../offertable";
import { ConnectedAddAssignmentDialog } from "./add-assignment-dialog";
import { ConnectedViewAssignmentDetailsAction } from "./assignment-details";
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
import { MissingActiveSessionWarning } from "../../components/sessions";
import { useSelector } from "react-redux";
import { activeSessionSelector } from "../../api/actions";

export function AdminAssignmentsView() {
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
                    Add Assignment
                </ActionButton>
                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedImportAssignmentsAction disabled={!activeSession} />
                <ConnectedExportAssignmentsAction disabled={!activeSession} />
                <ActionHeader>Selected Assignment Actions</ActionHeader>
                <ConnectedViewAssignmentDetailsAction />
                <ConnectedOfferActionButtons />
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view or modify assignments, you must select a session." />
                )}

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

export function InstructorAssignmentsView() {
    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedExportAssignmentsAction />
            </ActionsList>
            <ContentArea>
                <ConnectedOfferTable />
            </ContentArea>
        </div>
    );
}
