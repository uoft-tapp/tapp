import React from "react";
import { ConnectedAddDdahDialog } from "./add-ddah-dialog";
import { FaPlus } from "react-icons/fa";
import {
    ConnectedImportDdahsAction,
    ConnectedExportDdahsAction,
} from "./import-export";
import {
    ActionsList,
    ActionButton,
    ActionHeader,
} from "../../components/action-buttons";
import { ContentArea } from "../../components/layout";
import { ConnectedDdahsTable } from "../ddah-table";
import { MissingActiveSessionWarning } from "../../components/sessions";
import { useSelector } from "react-redux";
import { activeSessionSelector } from "../../api/actions";

export function AdminDdahsView(): React.ReactNode {
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
                >
                    Add DDAH
                </ActionButton>

                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedImportDdahsAction />
                <ConnectedExportDdahsAction />
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
                <ConnectedDdahsTable />
            </ContentArea>
        </div>
    );
}
