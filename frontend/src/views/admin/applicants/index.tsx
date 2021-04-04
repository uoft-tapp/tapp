import React from "react";
import { ConnectedApplicantsList } from "./editable-applicants-list";
import { ConnectedAddApplicantDialog } from "./add-applicant-dialog";
import { FaTrash, FaPlus } from "react-icons/fa";
import {
    ConnectedImportInstructorAction,
    ConnectedExportApplicantsAction,
} from "./import-export";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../../components/action-buttons";
import { ContentArea } from "../../../components/layout";

export function AdminApplicantsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    const [inDeleteMode, setInDeleteMode] = React.useState(false);
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
                    Add Applicant
                </ActionButton>
                <ActionButton
                    icon={<FaTrash />}
                    onClick={() => setInDeleteMode(!inDeleteMode)}
                    active={inDeleteMode}
                >
                    Delete Applicant
                </ActionButton>

                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedImportInstructorAction />
                <ConnectedExportApplicantsAction />
            </ActionsList>
            <ContentArea>
                <ConnectedAddApplicantDialog
                    show={addDialogVisible}
                    onHide={() => {
                        setAddDialogVisible(false);
                    }}
                />
                <ConnectedApplicantsList inDeleteMode={inDeleteMode} />
            </ContentArea>
        </div>
    );
}
