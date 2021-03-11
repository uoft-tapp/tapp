import React from "react";
import { ConnectedAddDdahDialog } from "./add-ddah-dialog";
import { FaPlus, FaMailBulk, FaCheck, FaTrash } from "react-icons/fa";
import {
    ConnectedImportDdahsAction,
    ConnectedExportDdahsAction,
    ConnectedDownloadPositionDdahTemplatesAction,
    ConnectedDownloadDdahsAcceptedListAction,
} from "./import-export";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../components/action-buttons";
import { ContentArea } from "../../components/layout";
import { ConnectedDdahsTable } from "../ddah-table";
import { MissingActiveSessionWarning } from "../../components/sessions";
import { useSelector, useDispatch } from "react-redux";
import { activeSessionSelector } from "../../api/actions";
import { ddahTableSelector } from "../ddah-table/actions";
import {
    ddahsSelector,
    emailDdah,
    approveDdah,
    deleteDdah,
} from "../../api/actions/ddahs";
import { Ddah } from "../../api/defs/types";
import { Button, Modal } from "react-bootstrap";

export function AdminDdahsView(): React.ReactNode {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    // While data is being imported, updating the react table takes a long time,
    // so we use this variable to hide the react table during import.
    const [importInProgress, setImportInProgress] = React.useState(false);
    const activeSession = useSelector(activeSessionSelector);
    const { selectedDdahIds } = useSelector(ddahTableSelector);
    const ddahs = useSelector<any, Ddah[]>(ddahsSelector);
    const dispatch = useDispatch();
    const selectedDdahs = ddahs.filter((ddah) =>
        selectedDdahIds.includes(ddah.id)
    );

    const [
        ddahDeletionConfirmationVisible,
        setDdahDeletionConfirmationVisible,
    ] = React.useState(false);

    function confirmDDAHDeletion() {
        if (selectedDdahs?.length > 1) {
            setDdahDeletionConfirmationVisible(true);
        } else {
            deleteDDAHs();
        }
    }

    function deleteDDAHs() {
        for (const ddah of selectedDdahs) {
            dispatch(deleteDdah(ddah));
        }

        setDdahDeletionConfirmationVisible(false);
    }

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
                    Add DDAH
                </ActionButton>
                <ConnectedDownloadPositionDdahTemplatesAction
                    disabled={!activeSession}
                />
                <ConnectedDownloadDdahsAcceptedListAction
                    disabled={!activeSession}
                />

                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedImportDdahsAction
                    disabled={!activeSession}
                    setImportInProgress={setImportInProgress}
                />
                <ConnectedExportDdahsAction disabled={!activeSession} />
                <ActionHeader>Selected DDAH Actions</ActionHeader>
                <ActionButton
                    icon={FaMailBulk}
                    onClick={() => {
                        for (const ddah of selectedDdahs) {
                            dispatch(emailDdah(ddah));
                        }
                    }}
                    disabled={selectedDdahIds.length === 0}
                >
                    Email DDAH
                </ActionButton>
                <ActionButton
                    icon={FaCheck}
                    onClick={() => {
                        for (const ddah of selectedDdahs) {
                            dispatch(approveDdah(ddah));
                        }
                    }}
                    disabled={selectedDdahIds.length === 0}
                >
                    Approve DDAH
                </ActionButton>
                <ActionButton
                    icon={FaTrash}
                    onClick={confirmDDAHDeletion}
                    disabled={selectedDdahIds.length === 0}
                >
                    Delete DDAH
                </ActionButton>
                <Modal
                    show={ddahDeletionConfirmationVisible}
                    onHide={() => {
                        setDdahDeletionConfirmationVisible(false);
                    }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Deleting Multiple DDAHs</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="mb-3">
                            You are deleting all of the following{" "}
                            {selectedDdahs?.length} DDAHs!
                        </div>
                        <div className="mb-3">
                            {selectedDdahs.map((selectedDdah) => {
                                let ddahStatus;
                                if (selectedDdah.status) {
                                    ddahStatus = selectedDdah.status;
                                } else {
                                    ddahStatus = "unsent";
                                }

                                return (
                                    <li>
                                        {`${selectedDdah.assignment.applicant.first_name} 
                                    ${selectedDdah.assignment.applicant.last_name}: 
                                    ${selectedDdah.assignment.position.position_code} 
                                    ${selectedDdah.assignment.position.position_title} 
                                    (${selectedDdah.total_hours} hrs, ${ddahStatus})`}
                                    </li>
                                );
                            })}
                        </div>
                        Are you sure?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            onClick={() => {
                                setDdahDeletionConfirmationVisible(false);
                            }}
                            variant="light"
                        >
                            Cancel
                        </Button>
                        <Button onClick={deleteDDAHs}>Delete All</Button>
                    </Modal.Footer>
                </Modal>
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view or modify DDAHs, you must select a session." />
                )}
                <ConnectedAddDdahDialog
                    show={addDialogVisible}
                    onHide={() => {
                        setAddDialogVisible(false);
                    }}
                />
                {!importInProgress && <ConnectedDdahsTable />}
            </ContentArea>
        </div>
    );
}
