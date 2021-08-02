import React from "react";
import { useSelector } from "react-redux";
import {
    activeSessionSelector,
    assignmentsSelector,
} from "../../../api/actions";
import { ActionHeader, ActionsList } from "../../../components/action-buttons";
import { ContentArea } from "../../../components/layout";
import { MissingActiveSessionWarning } from "../../../components/sessions";
import { ConnectedDdahsTable } from "./ddahs-table";
import type { Ddah } from "../../../api/defs/types";
import { ddahsSelector, upsertDdah } from "../../../api/actions/ddahs";
import { DdahPreviewModal } from "./ddah-editor";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { activePositionSelector } from "../store/actions";

export function InstructorDdahsView() {
    const activeSession = useSelector(activeSessionSelector);
    const ddahs = useSelector(ddahsSelector);
    const assignments = useSelector(assignmentsSelector);
    const dispatch = useThunkDispatch();
    const activePosition = useSelector(activePositionSelector);

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
                <ActionHeader>Actions</ActionHeader>
                <ActionHeader>Import/Export</ActionHeader>
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view or modify DDAHs, you must select a session." />
                )}
                <ConnectedDdahsTable
                    position_id={activePosition?.id || -1}
                    onView={(ddah_id) => {
                        const ddah = ddahs.find((d) => d.id === ddah_id);
                        if (ddah) {
                            setPreviewDdah(ddah);
                            setPreviewVisible(true);
                        }
                    }}
                    onCreate={(assignment_id) => {
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
