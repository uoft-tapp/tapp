import React from "react";
import XLSX from "xlsx";
import FileSaver from "file-saver";
import { useSelector } from "react-redux";
import {
    activeSessionSelector,
    assignmentsSelector,
} from "../../../api/actions";
import { ActionHeader, ActionsList } from "../../../components/action-buttons";
import { ContentArea } from "../../../components/layout";
import { ActionButton } from "../../../components/action-buttons";
import { ConnectedDdahsTable } from "./ddahs-table";
import type { Ddah } from "../../../api/defs/types";
import { ddahsSelector, upsertDdah } from "../../../api/actions/ddahs";
import { DdahPreviewModal } from "./ddah-editor";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { activePositionSelector, setDdahForEmailIds } from "../store/actions";
import {
    ConnectedExportDdahsAction,
    createDdahSpreadsheets,
} from "../../admin/ddahs/import-export";
import { setSelectedRows as setSelectedDdahs } from "../../admin/ddah-table/actions";
import { formatDate } from "../../../libs/utils";
import { DdahEmailModal } from "./ddah-emailer";
import { FaDownload, FaMailBulk } from "react-icons/fa";
import { InstructorImportDdahsAction } from "./import";

export function ConnectedDownloadPositionDdahTemplatesAction({
    disabled = false,
}) {
    const assignments = useSelector(assignmentsSelector);
    const ddahs = useSelector(ddahsSelector);
    const activePosition = useSelector(activePositionSelector);

    async function download() {
        if (!activePosition) {
            return;
        }
        const spreadsheets = createDdahSpreadsheets(ddahs, assignments);
        const array = spreadsheets[activePosition.position_code];
        // workbook sheets and file names can't have `/` or other special characters in them
        // So we replace them with `_` before we start.
        const sanitized_position_code = activePosition.position_code.replace(
            /[^A-z0-9 ]/g,
            "_"
        );
        const workbook = XLSX.utils.book_new();
        const sheet = XLSX.utils.aoa_to_sheet(array);
        XLSX.utils.book_append_sheet(
            workbook,
            sheet,
            // Sheet names are limited to 31 characters in length
            `${sanitized_position_code} DDAHs`.slice(0, 30)
        );
        const rawSpreadsheet = XLSX.write(workbook, {
            type: "array",
            bookType: "xlsx",
        });

        const file = new File(
            [rawSpreadsheet],

            `${sanitized_position_code}-DDAHs.xlsx`,
            {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }
        );

        FileSaver.saveAs(file);
    }

    return (
        <ActionButton
            icon={FaDownload}
            title="Download a spreadsheet template that you may fill to bulk create/update DDAHs"
            onClick={() => download()}
            disabled={disabled}
        >
            DDAH Template
        </ActionButton>
    );
}

export function InstructorDdahsView() {
    const activeSession = useSelector(activeSessionSelector);
    const ddahs = useSelector(ddahsSelector);
    const assignments = useSelector(assignmentsSelector);
    const dispatch = useThunkDispatch();
    const activePosition = useSelector(activePositionSelector);

    const [previewVisible, setPreviewVisible] = React.useState<boolean>(false);
    const [newDialogVisible, setNewDialogVisible] =
        React.useState<boolean>(false);
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

    React.useEffect(() => {
        const ddahIds = ddahs
            .filter(
                (ddah) => ddah.assignment.position.id === activePosition?.id
            )
            .map((ddah) => ddah.id);
        dispatch(setSelectedDdahs(ddahIds));
    }, [dispatch, activePosition, ddahs]);

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
                <ActionButton
                    icon={FaMailBulk}
                    onClick={() => {
                        // Deselect all selected DDAHs when we click this button to prevent accidental emails.
                        dispatch(setDdahForEmailIds([]));
                        setEmailDialogVisible(true);
                    }}
                >
                    Email DDAHs
                </ActionButton>
                <ConnectedDownloadPositionDdahTemplatesAction />
                <ActionHeader>Import/Export</ActionHeader>
                <InstructorImportDdahsAction disabled={!activeSession} />
                <ConnectedExportDdahsAction disabled={!activeSession} />
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
                    session. You can view, create, and edit DDAH forms for your
                    TAs. After you create/edit a DDAH form, don't forget to
                    email the form to your TAs.
                </p>
                <p>
                    The <i>Approved</i> column indicates whether the TA
                    coordinator has reviewed and approved the DDAH. If you have
                    any questions about DDAHs and their requirements, please
                    contact the TA coordinator.
                </p>
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
