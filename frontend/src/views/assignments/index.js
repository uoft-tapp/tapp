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
import { Spinner } from "react-bootstrap";

export function AdminAssignmentsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    const activeSession = useSelector(activeSessionSelector);
    // While data is being imported, updating the react table takes a long time,
    // so we use this variable to hide the react table during import.
    const [inProgress, setInProgress] = React.useState(false);

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
                <ConnectedImportAssignmentsAction
                    disabled={!activeSession}
                    setImportInProgress={setInProgress}
                />
                <ConnectedExportAssignmentsAction
                    disabled={!activeSession}
                    setExportInProgress={setInProgress}
                />
                <ActionHeader>Selected Assignment Actions</ActionHeader>
                <ConnectedViewAssignmentDetailsAction />
                <ConnectedOfferActionButtons />
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view or modify assignments, you must select a session." />
                )}

                {inProgress ? (
                    <React.Fragment>
                        <Spinner animation="border" className="mr-2" />
                        In Progress
                    </React.Fragment>
                ) : (
                    <ConnectedOfferTable />
                )}
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
                <ConnectedOfferTable editable={false} />
            </ContentArea>
        </div>
    );
}
