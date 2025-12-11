import React from "react";
import { ConnectedOfferTable } from "../offertable";
import { ConnectedAddAssignmentDialog } from "./add-assignment-dialog";
import { ConnectedViewAssignmentDetailsAction } from "./assignment-details";
import { ConnectedOfferActionButtons } from "./offer-actions";
import { DownloadOfferPdfs } from "./download-offers";
import {
    ConnectedExportAssignmentsAction,
    ConnectedImportAssignmentsAction,
} from "./import-export";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../../components/action-buttons";
import { ContentArea } from "../../../components/layout";
import { FaEdit, FaPlus } from "react-icons/fa";
import { MissingActiveSessionWarning } from "../../../components/sessions";
import { useSelector } from "react-redux";
import {
    activeSessionSelector,
    assignmentsSelector,
} from "../../../api/actions";
import { Spinner } from "react-bootstrap";
import { offerTableSelector } from "../offertable/actions";
import { Assignment } from "../../../api/defs/types";
import { ConnectedEditAssignmentDialog } from "./edit-assignment-dialog";

export function AdminAssignmentsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    const [editDialogVisible, setEditDialogVisible] = React.useState(false);
    const activeSession = useSelector(activeSessionSelector);
    // While data is being imported, updating the react table takes a long time,
    // so we use this variable to hide the react table during import.
    const [inProgress, setInProgress] = React.useState(false);
    const { selectedAssignmentIds } = useSelector(offerTableSelector);
    const assignments = useSelector(assignmentsSelector);
    const assignmentsById = React.useMemo(() => {
        const ret: Record<number, Assignment> = {};
        for (const assignment of assignments) {
            ret[assignment.id] = assignment;
        }
        return ret;
    }, [assignments]);
    const selectedAssignments = React.useMemo(
        () => selectedAssignmentIds.map((id) => assignmentsById[id]),
        [selectedAssignmentIds, assignmentsById]
    );

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
                <DownloadOfferPdfs selectedAssignments={selectedAssignments} />
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
                <ConnectedOfferActionButtons
                    selectedAssignments={selectedAssignments}
                />
                <ActionButton
                    disabled={!(selectedAssignments.length === 1)}
                    title={
                        selectedAssignments.length === 1
                            ? "Edit the selected assignment"
                            : "Please select a single assignment to edit (you cannot edit multiple assignments at the same time)"
                    }
                    onClick={() => setEditDialogVisible(true)}
                    icon={<FaEdit />}
                >
                    Edit Assignment
                </ActionButton>
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view or modify assignments, you must select a session." />
                )}

                {inProgress ? (
                    <React.Fragment>
                        <Spinner animation="border" className="me-2" />
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
                <ConnectedEditAssignmentDialog
                    show={editDialogVisible}
                    onHide={() => {
                        setEditDialogVisible(false);
                    }}
                    assignment={selectedAssignments[0]}
                />
            </ContentArea>
        </div>
    );
}
