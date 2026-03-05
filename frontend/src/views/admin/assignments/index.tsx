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
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { MissingActiveSessionWarning } from "../../../components/sessions";
import { useSelector } from "react-redux";
import {
    activeSessionSelector,
    assignmentsSelector,
    deleteAssignments,
} from "../../../api/actions";
import { Button, Modal, Spinner } from "react-bootstrap";
import { offerTableSelector } from "../offertable/actions";
import { Assignment } from "../../../api/defs/types";
import { ConnectedEditAssignmentDialog } from "./edit-assignment-dialog";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { generateHeaderCell } from "../../../components/table-utils";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

export function AdminAssignmentsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    const [editDialogVisible, setEditDialogVisible] = React.useState(false);
    const activeSession = useSelector(activeSessionSelector);
    // While data is being imported, updating the react table takes a long time,
    // so we use this variable to hide the react table during import.
    const [inProgress, setInProgress] = React.useState(false);
    const [inDeleteMode, setInDeleteMode] = React.useState(false);
    const [deleteInProgress, setDeleteInProgress] = React.useState(false);
    const dispatch = useThunkDispatch();
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
        () =>
            selectedAssignmentIds
                .map((id) => assignmentsById[id])
                .filter((a) => a != null),
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
                <ActionButton
                    icon={<FaTrash />}
                    onClick={() => setInDeleteMode(!inDeleteMode)}
                    active={inDeleteMode}
                    disabled={
                        !activeSession ||
                        selectedAssignments.length === 0 ||
                        selectedAssignments.filter(
                            (a) => a.active_offer_status != null
                        ).length > 0
                    }
                    title="Delete the selected assignments. These assignments cannot have an offer that was sent/withdrawn/accepted/pending."
                >
                    Delete Assignment
                </ActionButton>
                <ConfirmDeleteDialog
                    show={inDeleteMode}
                    onHide={() => setInDeleteMode(false)}
                    onDelete={async () => {
                        setDeleteInProgress(true);
                        try {
                            await dispatch(
                                deleteAssignments(selectedAssignments)
                            );
                        } finally {
                            setDeleteInProgress(false);
                            setInDeleteMode(false);
                        }
                    }}
                    spinner={deleteInProgress}
                    assignments={selectedAssignments}
                />
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

const DELETE_DIALOG_COLUMNS = [
    {
        Header: generateHeaderCell("Last Name"),
        id: "last_name",
        accessor: "last_name",
    },
    {
        Header: generateHeaderCell("First Name"),
        id: "first_name",
        accessor: "first_name",
    },
    {
        Header: generateHeaderCell("Position"),
        id: "position_code",
        accessor: "position_code",
    },
    {
        Header: generateHeaderCell("Hours"),
        id: "hours",
        accessor: "hours",
    },
];

function ConfirmDeleteDialog(props: {
    show: boolean;
    onHide: (...args: any[]) => any;
    onDelete: (...args: any[]) => any;
    assignments: Assignment[] | null;
    spinner?: boolean;
}) {
    const { show, onHide, onDelete, assignments, spinner } = props;
    const assignmentsForTable = React.useMemo(() => {
        if (!assignments) {
            return [];
        }
        return assignments.map((a) => ({
            position_code: a.position.position_code,
            hours: a.hours,
            last_name: a.applicant.last_name,
            first_name: a.applicant.first_name,
            id: a.id,
        }));
    }, [assignments]);
    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Delete Assignments</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete the following assignments? This
                action cannot be undone.
                <AdvancedFilterTable
                    columns={DELETE_DIALOG_COLUMNS}
                    data={assignmentsForTable}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button onClick={onDelete} title="Delete Assignment">
                    {spinner ? (
                        <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                        />
                    ) : null}
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
