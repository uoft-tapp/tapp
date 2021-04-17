import React from "react";
import { ConnectedAddDdahDialog } from "./add-ddah-dialog";
import { FaPlus } from "react-icons/fa";
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
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import {
    ApproveDdahsButtonWithDialog,
    DeleteDdahsButtonWithDialog,
    EmailDdahsButtonWithDialog,
} from "./selected-ddah-actions";

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

    function deleteDDAHs() {
        return Promise.all(
            selectedDdahs.map((ddah) => dispatch(deleteDdah(ddah)))
        );
    }

    function emailDDAHs() {
        return Promise.all(
            selectedDdahs.map((ddah) => dispatch(emailDdah(ddah)))
        );
    }

    function approveDDAHs() {
        return Promise.all(
            selectedDdahs.map((ddah) => dispatch(approveDdah(ddah)))
        );
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
                <EmailDdahsButtonWithDialog
                    callback={emailDDAHs}
                    selectedDdahs={selectedDdahs}
                    disabled={selectedDdahIds.length === 0}
                />
                <ApproveDdahsButtonWithDialog
                    callback={approveDDAHs}
                    selectedDdahs={selectedDdahs}
                    disabled={selectedDdahIds.length === 0}
                />
                <DeleteDdahsButtonWithDialog
                    callback={deleteDDAHs}
                    selectedDdahs={selectedDdahs}
                    disabled={selectedDdahIds.length === 0}
                />
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
