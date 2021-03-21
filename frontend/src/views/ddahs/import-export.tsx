import React from "react";
import FileSaver from "file-saver";
import JSZip from "jszip";
import XLSX from "xlsx";
import { applicantsSelector, assignmentsSelector } from "../../api/actions";
import { useSelector, useDispatch } from "react-redux";
import { ExportActionButton } from "../../components/export-button";
import { ImportActionButton } from "../../components/import-button";
import { Alert } from "react-bootstrap";
import {
    prepareSpreadsheet,
    prepareDdahDataFactory,
    normalizeDdahImports,
} from "../../libs/import-export";
import { diffImport, getChanged, DiffSpec } from "../../libs/diffs";
import { Applicant, Ddah, MinimalDdah, Assignment } from "../../api/defs/types";
import {
    exportDdahs,
    ddahsSelector,
    upsertDdahs,
    downloadDdahAcceptedList,
} from "../../api/actions/ddahs";
import { DdahsList, DdahsDiffList } from "../../components/ddahs";
import { ddahTableSelector } from "../ddah-table/actions";
import { ActionButton } from "../../components/action-buttons";
import { FaDownload } from "react-icons/fa";

/**
 * Allows for the download of a file blob containing the exported instructors.
 * Instructors are synchronized from the server before being downloaded.
 *
 * @export
 * @returns
 */
export function ConnectedExportDdahsAction({ disabled = false }) {
    const dispatch = useDispatch();
    const [exportType, setExportType] = React.useState<
        "spreadsheet" | "json" | null
    >(null);

    const { selectedDdahIds } = useSelector<any, { selectedDdahIds: Number[] }>(
        ddahTableSelector
    );

    React.useEffect(() => {
        if (!exportType) {
            return;
        }

        async function doExport() {
            // Having an export type of `null` means we're ready to export again,
            // We set the export type to null at the start so in case an error occurs,
            // we can still try again. This *will not* affect the current value of `exportType`
            setExportType(null);

            const file = await dispatch(
                exportDdahs(
                    prepareDdahDataFactory(
                        (ddahs: Ddah[], selectedIds = selectedDdahIds) => {
                            // If we have selected specific DDAHs, filter so we only export them.
                            if (selectedIds && selectedIds.length > 0) {
                                ddahs = ddahs.filter((d: Ddah) =>
                                    selectedIds.includes(d.id)
                                );
                            }
                            return ddahs;
                        }
                    ),
                    exportType
                )
            );
            FileSaver.saveAs(file);
        }
        doExport().catch(console.error);
    }, [exportType, dispatch, selectedDdahIds]);

    function onClick(option: "spreadsheet" | "json") {
        setExportType(option);
    }

    return <ExportActionButton onClick={onClick} disabled={disabled} />;
}

export function ConnectedImportDdahsAction({
    disabled = false,
    setImportInProgress = null,
}: {
    disabled: boolean;
    setImportInProgress?: Function | null;
}) {
    const dispatch = useDispatch();
    const ddahs = useSelector<any, Ddah[]>(ddahsSelector);
    const assignments = useSelector<any, Assignment[]>(assignmentsSelector);
    const applicants = useSelector<any, Applicant[]>(applicantsSelector);
    const [fileContent, setFileContent] = React.useState<{
        fileType: "json" | "spreadsheet";
        data: any;
    } | null>(null);
    const [diffed, setDiffed] = React.useState<
        DiffSpec<MinimalDdah, Ddah>[] | null
    >(null);
    const [processingError, setProcessingError] = React.useState(null);
    const [inProgress, _setInProgress] = React.useState(false);

    function setInProgress(state: boolean) {
        _setInProgress(state);
        if (typeof setImportInProgress === "function") {
            setImportInProgress(state);
        }
    }

    // Make sure we aren't showing any diff if there's no file loaded.
    React.useEffect(() => {
        if (!fileContent) {
            if (diffed) {
                setDiffed(null);
            }
        }
    }, [diffed, setDiffed, fileContent]);

    // Recompute the diff every time the file changes
    React.useEffect(() => {
        // If we have no file or we are currently in the middle of processing another file,
        // do nothing.
        if (!fileContent || inProgress) {
            return;
        }
        try {
            setProcessingError(null);
            // normalize the data coming from the file
            const data = normalizeDdahImports(fileContent, applicants);
            // Compute which applicants have been added/modified
            const newDiff = diffImport.ddahs(data, { ddahs, assignments });

            setDiffed(newDiff);
        } catch (e) {
            console.warn(e);
            setProcessingError(e);
        }
    }, [fileContent, ddahs, assignments, applicants, inProgress]);

    async function onConfirm() {
        if (!diffed) {
            throw new Error("Unable to compute an appropriate diff");
        }
        const changedDdahs = getChanged(diffed);

        await dispatch(upsertDdahs(changedDdahs));

        setFileContent(null);
    }

    return (
        <ImportActionButton
            onConfirm={onConfirm}
            onFileChange={setFileContent}
            dialogContent={
                <DialogContent
                    diffed={diffed}
                    processingError={processingError}
                />
            }
            setInProgress={setInProgress}
            disabled={disabled}
        />
    );
}

const DEFAULT_DDAH = {
    duties: [
        {
            order: 1,
            hours: 0,
            description: "",
        },
        {
            order: 2,
            hours: 0,
            description: "",
        },
        {
            order: 3,
            hours: 0,
            description: "",
        },
        {
            order: 4,
            hours: 0,
            description: "",
        },
    ],
};

/**
 * Turn a list of ddahs and assignments into an object
 * with Arrays of Arrays (suitable for turning into spreadsheets) of DDAHs
 * split by position codes.
 *
 * @param {Ddah[]} ddahs
 * @param {Assignment[]} assignments
 * @returns
 */
function createDdahSpreadsheets(ddahs: Ddah[], assignments: Assignment[]) {
    const ddahsByAssignmentId: { [key: string]: Ddah } = {};
    for (const ddah of ddahs) {
        ddahsByAssignmentId[ddah.assignment.id] = ddah;
    }

    // Create DDAHs for all assignments, but use the real DDAH if
    // it exists.
    const allDdahs = assignments
        .map((assignment) => {
            // Rejected or withdrawn assignments shouldn't show up on the DDAH list
            if (
                assignment.active_offer_status === "rejected" ||
                assignment.active_offer_status === "withdrawn"
            ) {
                // We return null in this case; we will filter out
                // the null results later.
                return null;
            }
            if (ddahsByAssignmentId[assignment.id]) {
                return ddahsByAssignmentId[assignment.id];
            }
            return { ...DEFAULT_DDAH, assignment: assignment };
        })
        .filter((x) => x) as Ddah[];
    allDdahs.sort(({ assignment: a }, { assignment: b }) => {
        const aHash = `${a.position.position_code} ${a.applicant.last_name} ${a.applicant.first_name}`;
        const bHash = `${b.position.position_code} ${b.applicant.last_name} ${b.applicant.first_name}`;
        return aHash === bHash ? 0 : aHash > bHash ? 1 : -1;
    });

    // Get a list of all the positions
    const posSet = new Set<string>();
    for (const ddah of allDdahs) {
        posSet.add(ddah.assignment.position.position_code);
    }

    // Create an object with arrays of DDAHs for every position
    const ddahsByPosition: { [key: string]: any[][] } = {};
    for (const position_code of Array.from(posSet)) {
        ddahsByPosition[position_code] = prepareSpreadsheet.ddah(
            allDdahs.filter(
                (ddah) =>
                    ddah.assignment.position.position_code === position_code
            )
        );
    }

    return ddahsByPosition;
}

async function arraysByKeyToZip(arrays: { [key: string]: any[][] }) {
    const zip = new JSZip();

    for (const [position_code, array] of Object.entries(arrays)) {
        // workbook sheets and file names can't have `/` or other special characters in them
        // So we replace them with `_` before we start.
        const sanitized_position_code = position_code.replace(
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
            type: "binary",
            bookType: "xlsx",
        });
        zip.file(`${sanitized_position_code}-DDAHs.xlsx`, rawSpreadsheet, {
            binary: true,
        });
    }

    const blob = await zip.generateAsync({ type: "blob" });
    return blob;
}

export function ConnectedDownloadPositionDdahTemplatesAction({
    disabled = false,
}) {
    const assignments = useSelector<any, Assignment[]>(assignmentsSelector);
    const ddahs = useSelector<any, Ddah[]>(ddahsSelector);

    async function download() {
        const spreadsheets = createDdahSpreadsheets(ddahs, assignments);
        const blob = await arraysByKeyToZip(spreadsheets);
        FileSaver.saveAs(blob, "DDAHs-by-position.zip");
    }

    return (
        <ActionButton
            icon={FaDownload}
            title="Download by-position spreadsheets appropriate for filling in and uploading to create DDAHs"
            onClick={() => download()}
            disabled={disabled}
        >
            By-Position Templates
        </ActionButton>
    );
}

export function ConnectedDownloadDdahsAcceptedListAction({ disabled = false }) {
    const dispatch = useDispatch();

    async function downloadClicked() {
        const file = await dispatch(downloadDdahAcceptedList());
        FileSaver.saveAs(file);
    }

    return (
        <ActionButton
            icon={FaDownload}
            title="Download a list of DDAHs that have been signed by TAs this session"
            onClick={() => downloadClicked()}
            disabled={disabled}
        >
            Signature List
        </ActionButton>
    );
}

const DialogContent = React.memo(function DialogContent({
    diffed,
    processingError,
}: {
    diffed: DiffSpec<MinimalDdah, Ddah>[] | null;
    processingError: string | null;
}) {
    let dialogContent = <p>No data loaded...</p>;
    if (processingError) {
        dialogContent = <Alert variant="danger">{"" + processingError}</Alert>;
    } else if (diffed) {
        const newItems = diffed
            .filter((item) => item.status === "new")
            .map((item) => item.obj);
        const modifiedDiffSpec = diffed.filter(
            (item) => item.status === "modified"
        );

        if (newItems.length === 0 && modifiedDiffSpec.length === 0) {
            dialogContent = (
                <Alert variant="warning">
                    No difference between imported applicants and those already
                    on the system.
                </Alert>
            );
        } else {
            dialogContent = (
                <>
                    {newItems.length > 0 && (
                        <Alert variant="primary">
                            <span className="mb-1">
                                The following applicants will be{" "}
                                <strong>added</strong>
                            </span>
                            <DdahsList ddahs={newItems} />
                        </Alert>
                    )}
                    {modifiedDiffSpec.length > 0 && (
                        <Alert variant="info">
                            <span className="mb-1">
                                The following instructors will be{" "}
                                <strong>modified</strong>
                            </span>
                            <DdahsDiffList modifiedDdahs={modifiedDiffSpec} />
                        </Alert>
                    )}
                </>
            );
        }
    }

    return dialogContent;
});
