import React from "react";
import { useSelector } from "react-redux";

import { ConnectedAddPositionDialog } from "./add-position-dialog";
import { ConnectedPositionsList } from "./position-list";
import {
    ConnectedExportPositionsAction,
    ConnectedImportPositionsAction,
} from "./import-export";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../../components/action-buttons";
import { ContentArea } from "../../../components/layout";
import { FaPlus, FaTrash } from "react-icons/fa";
import { activeSessionSelector } from "../../../api/actions";
import { MissingActiveSessionWarning } from "../../../components/sessions";
import { ConnectedPositionDetailsDialog } from "./position-details-dialog";

export function AdminPositionsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    const [inDeleteMode, setInDeleteMode] = React.useState(false);
    const activeSession = useSelector(activeSessionSelector);
    // While data is being imported, updating the react table takes a long time,
    // so we use this variable to hide the react table during import.
    const [importInProgress, setImportInProgress] = React.useState(false);

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
                    Add Position
                </ActionButton>
                <ActionButton
                    icon={<FaTrash />}
                    onClick={() => setInDeleteMode(!inDeleteMode)}
                    active={inDeleteMode}
                    disabled={!activeSession}
                >
                    Delete Position
                </ActionButton>
                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedImportPositionsAction
                    disabled={!activeSession}
                    setImportInProgress={setImportInProgress}
                />
                <ConnectedExportPositionsAction disabled={!activeSession} />
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view or modify positions, you must select a session." />
                )}
                <ConnectedAddPositionDialog
                    show={addDialogVisible}
                    onHide={() => {
                        setAddDialogVisible(false);
                    }}
                />
                {!importInProgress && (
                    <ConnectedPositionsList inDeleteMode={inDeleteMode} />
                )}
                <ConnectedPositionDetailsDialog />
            </ContentArea>
        </div>
    );
}

export { ConnectedAddPositionDialog, ConnectedPositionsList };
