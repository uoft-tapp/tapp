import React from "react";
import { ActionsList, ActionHeader } from "../../../components/action-buttons";
import { ContentArea } from "../../../components/layout";
import { InstructorAssignmentsTable } from "./assignments-table";
import { useSelector } from "react-redux";
import { activePositionSelector } from "../store/actions";
import { activeSessionSelector, assignmentsSelector } from "../../../api/actions";
import { formatDate } from "../../../libs/utils";
import { ConnectedExportAssignmentsAction } from "./import-export";
import { ddahsSelector, upsertDdah } from "../../../api/actions/ddahs";
import { Ddah } from "../../../api/defs/types";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { DdahPreviewModal } from "../ddahs/ddah-editor";
import { DdahEmailModal } from "../ddahs/ddah-emailer";

export function InstructorAssignmentsView() {
    const activeSession = useSelector(activeSessionSelector);
    const activePosition = useSelector(activePositionSelector);
    const ddahs = useSelector(ddahsSelector);
    const assignments = useSelector(assignmentsSelector);
    const dispatch = useThunkDispatch();

    const [previewVisible, setPreviewVisible] = React.useState<Boolean>(false);
    const [newDialogVisible, setNewDialogVisible] = React.useState<Boolean>(
        false
    );
    const [_previewDdah, _setPreviewDdah] = React.useState<Omit<
        Ddah,
        "id"
    > | null>(null);
    const [previewDdahId, setPreviewDdahId] = React.useState<number | null>(
        null
    );
    const [emailDialogVisible, setEmailDialogVisible] = React.useState(false);

    const setPreviewDdah = React.useCallback(
        (ddah: Omit<Ddah, "id">) => {
            const ddahId = (ddah as any)?.id;
            setPreviewDdahId(ddahId || null);

            _setPreviewDdah(ddah);
        },
        [setPreviewDdahId, _setPreviewDdah]
    );

    const previewDdah: Omit<Ddah, "id"> | null = React.useMemo(() => {
        if (previewDdahId) {
            return (
                ddahs.find((ddah) => ddah.id === previewDdahId) || _previewDdah
            );
        }
        return _previewDdah;
    }, [ddahs, _previewDdah, previewDdahId]);

    if (!activeSession || !activePosition) {
        return (
            <h4>Please select a Session and Position to see TA information</h4>
        );
    }

    const formattedPositionName = `${activePosition.position_code} ${
        activePosition.position_title
            ? ` (${activePosition.position_title})`
            : ""
    }`;
    const formattedSessionName = `${activeSession.name} (${formatDate(
        activeSession.start_date
    )} to ${formatDate(activeSession.end_date)})`;

    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Actions</ActionHeader>
                <ConnectedExportAssignmentsAction />
            </ActionsList>
            <ContentArea>
                <h4>
                    <span>{formattedPositionName}</span>
                </h4>
                <p>
                    Below is a list of your TAs for{" "}
                    <span className="text-primary">
                        {formattedPositionName}
                    </span>{" "}
                    for the{" "}
                    <span className="text-primary">{formattedSessionName}</span>{" "}
                    session. TAs will only show up in this list if they have
                    been emailed an offer (status <i>pending</i>) or if they
                    have accepted an offer (status <i>accepted</i>). TAs who
                    have rejected an offer or had their offer withdrawn will now
                    show up.
                </p>
                <InstructorAssignmentsTable
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
                    onEmail={() => setEmailDialogVisible(true)}
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
                        const returnedDdah = await dispatch(
                            upsertDdah(newDdah)
                        );
                        setPreviewDdahId(returnedDdah.id);
                        setNewDialogVisible(false);
                        setPreviewVisible(true);
                    }}
                />
                <DdahEmailModal
                    show={emailDialogVisible}
                    onHide={() => setEmailDialogVisible(false)}
                />
            </ContentArea>
        </div>
    );
}
