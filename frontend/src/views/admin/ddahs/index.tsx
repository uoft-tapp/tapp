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
} from "../../../components/action-buttons";
import { ContentArea } from "../../../components/layout";
import { ConnectedDdahsTable } from "../ddah-table";
import { MissingActiveSessionWarning } from "../../../components/sessions";
import { useSelector } from "react-redux";
import { activeSessionSelector } from "../../../api/actions";
import { ddahTableSelector } from "../ddah-table/actions";
import {
    ddahsSelector,
    emailDdah,
    approveDdah,
    deleteDdah,
} from "../../../api/actions/ddahs";
import { Ddah } from "../../../api/defs/types";
import { MultiManipulateDdahConfirmation } from "./manipulate-ddah-confirmation";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

export function AdminDdahsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    // While data is being imported, updating the react table takes a long time,
    // so we use this variable to hide the react table during import.
    const [importInProgress, setImportInProgress] = React.useState(false);
    const activeSession = useSelector(activeSessionSelector);
    const { selectedDdahIds } = useSelector(ddahTableSelector);
    const ddahs = useSelector<any, Ddah[]>(ddahsSelector);
    const dispatch = useThunkDispatch();
    const selectedDdahs = ddahs.filter((ddah) =>
        selectedDdahIds.includes(ddah.id)
    );

    const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(
        false
    );

    const [showEmailConfirmation, setShowEmailConfirmation] = React.useState(
        false
    );

    const [
        showApproveConfirmation,
        setShowApproveConfirmation,
    ] = React.useState(false);

    function confirmDDAHDeletion() {
        if (selectedDdahs?.length > 1) {
            setShowDeleteConfirmation(true);
        } else {
            deleteDDAHs();
        }
    }

    function confirmDDAHEmail() {
        if (selectedDdahs?.length > 1) {
            setShowEmailConfirmation(true);
        } else {
            emailDDAHs();
        }
    }

    function confirmDDAHApprove() {
        if (selectedDdahs?.length > 1) {
            setShowApproveConfirmation(true);
        } else {
            approveDDAHs();
        }
    }

    function deleteDDAHs() {
        for (const ddah of selectedDdahs) {
            dispatch(deleteDdah(ddah));
        }
    }

    function emailDDAHs() {
        for (const ddah of selectedDdahs) {
            dispatch(emailDdah(ddah));
        }
    }

    function approveDDAHs() {
        for (const ddah of selectedDdahs) {
            dispatch(approveDdah(ddah));
        }
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
                    onClick={confirmDDAHEmail}
                    disabled={selectedDdahIds.length === 0}
                >
                    Email DDAH
                </ActionButton>
                <ActionButton
                    icon={FaCheck}
                    onClick={confirmDDAHApprove}
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
            <MultiManipulateDdahConfirmation
                selectedDdahs={selectedDdahs}
                visible={showDeleteConfirmation}
                setVisible={setShowDeleteConfirmation}
                manipulateDDAHs={deleteDDAHs}
                titleMsg="Deleting Multiple DDAHs"
                alertMsg={`You are deleting all of the following ${selectedDdahs.length} DDAHs`}
                confirmBtnMsg={`Delete ${selectedDdahs.length} DDAHs`}
            />
            <MultiManipulateDdahConfirmation
                selectedDdahs={selectedDdahs}
                visible={showEmailConfirmation}
                setVisible={setShowEmailConfirmation}
                manipulateDDAHs={emailDDAHs}
                titleMsg="Emailing Multiple DDAHs"
                alertMsg={`You are emailing all of the following ${selectedDdahs.length} DDAHs`}
                confirmBtnMsg={`Email ${selectedDdahs.length} DDAHs`}
            />
            <MultiManipulateDdahConfirmation
                selectedDdahs={selectedDdahs}
                visible={showApproveConfirmation}
                setVisible={setShowApproveConfirmation}
                manipulateDDAHs={approveDDAHs}
                titleMsg="Approving Multiple DDAHs"
                alertMsg={`You are approving all of the following ${selectedDdahs.length} DDAHs`}
                confirmBtnMsg={`Approve ${selectedDdahs.length} DDAHs`}
            />
        </div>
    );
}
