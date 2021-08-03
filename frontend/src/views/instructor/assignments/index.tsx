import React from "react";
import { ConnectedTAsTable } from "./tas-table";
import { ConnectedExportAssignmentsAction } from "../../admin/assignments/import-export";
import { ActionsList, ActionHeader } from "../../../components/action-buttons";
import { ContentArea } from "../../../components/layout";
import { useSelector } from "react-redux";
import {
    activeSessionSelector,
    assignmentsSelector,
} from "../../../api/actions";
import { ddahsSelector, upsertDdah } from "../../../api/actions/ddahs";
import { Ddah } from "../../../api/defs/types";
import { MissingActiveSessionWarning } from "../../../components/sessions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { activePositionSelector } from "../store/actions";
import { DdahPreviewModal } from "../ddahs/ddah-editor";

export function InstructorAssignmentsView() {
    const activeSession = useSelector(activeSessionSelector);
    const dispatch = useThunkDispatch();
    const activePosition = useSelector(activePositionSelector);
    const assignments = useSelector(assignmentsSelector);

    const [previewVisible, setPreviewVisible] = React.useState<Boolean>(false);
    const [newDialogVisible, setNewDialogVisible] = React.useState<Boolean>(
        false
    );
    const [previewDdah, setPreviewDdah] = React.useState<Omit<
        Ddah,
        "id"
    > | null>(null);

    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedExportAssignmentsAction />
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view or modify DDAHs, you must select a session." />
                )}
                <ConnectedTAsTable
                    position_id={activePosition?.id || -1}
                    onViewDDAH={(ddah) => {
                        if (ddah) {
                            setPreviewDdah(ddah);
                            setPreviewVisible(true);
                        }
                    }}
                    onCreateDDAH={(assignment_id: number) => {
                        const assignment = assignments.find(
                            (a) => a.id === assignment_id
                        );
                        if (!assignment) {
                            console.warn(
                                "Could not find assignment with id",
                                assignment_id
                            );
                            return;
                        }
                        const newDdah: Omit<Ddah, "id"> = {
                            duties: [],
                            approved_date: null,
                            accepted_date: null,
                            revised_date: null,
                            emailed_date: null,
                            signature: null,
                            url_token: "",
                            total_hours: 0,
                            assignment,
                            status: null,
                        };
                        setPreviewDdah(newDdah);
                        setNewDialogVisible(true);
                    }}
                />
                <DdahPreviewModal
                    ddah={previewDdah}
                    show={previewVisible}
                    onHide={() => setPreviewVisible(false)}
                    onEdit={async (newDdah: Ddah) => {
                        await dispatch(upsertDdah(newDdah));
                    }}
                />
                <DdahPreviewModal
                    ddah={previewDdah}
                    show={newDialogVisible}
                    forceEditMode={true}
                    onHide={() => setNewDialogVisible(false)}
                    onEdit={async (newDdah: Ddah) => {
                        await dispatch(upsertDdah(newDdah));
                        setNewDialogVisible(false);
                        setPreviewVisible(true);
                    }}
                />
            </ContentArea>
        </div>
    );
}
