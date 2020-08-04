import React from "react";
import { ConnectedInstructorsList } from "./editable-instructors-list";
import { ConnectedAddInstructorDialog } from "./add-instructor-dialog";
import { FaTrash, FaPlus } from "react-icons/fa";
import {
    ConnectedImportInstructorAction,
    ConnectedExportInstructorsAction,
} from "./import-export";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../components/action-buttons";
import { ContentArea } from "../../components/layout";

export function AdminInstructorsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    const [inDeleteMode, setInDeleteMode] = React.useState(false);
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
                >
                    Add Instructor
                </ActionButton>
                <ActionButton
                    icon={<FaTrash />}
                    onClick={() => setInDeleteMode(!inDeleteMode)}
                    active={inDeleteMode}
                >
                    Delete Instructor
                </ActionButton>

                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedImportInstructorAction
                    setImportInProgress={setImportInProgress}
                />
                <ConnectedExportInstructorsAction />
            </ActionsList>
            <ContentArea>
                <ConnectedAddInstructorDialog
                    show={addDialogVisible}
                    onHide={() => {
                        setAddDialogVisible(false);
                    }}
                />
                {!importInProgress && (
                    <ConnectedInstructorsList inDeleteMode={inDeleteMode} />
                )}
            </ContentArea>
        </div>
    );
}

export { ConnectedInstructorsList, ConnectedAddInstructorDialog };
