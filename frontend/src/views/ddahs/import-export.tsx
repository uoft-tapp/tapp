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
    dataToFile,
    SpreadsheetRowMapper,
    matchByUtoridOrName,
} from "../../libs/importExportUtils";
import { prepareMinimal } from "../../libs/exportUtils";
import { diffImport, getChanged, DiffSpec } from "../../libs/diffUtils";
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
 * Return an array of [hours, duty, hours duty, ...] for the specified `ddah`
 *
 * @param {Ddah} ddah
 * @returns {((string | number)[])}
 */
function flattenDuties(ddah: Ddah): (string | number)[] {
    const ret = [];
    const duties = [...ddah.duties];
    duties.sort((a, b) => a.order - b.order);

    for (const duty of duties) {
        ret.push(duty.hours);
        ret.push(duty.description);
    }

    return ret;
}

/**
 * Turns an array of Ddah objects into an Array of Arrays suitable
 * for converting into a spreadsheet.
 *
 * @export
 * @param {Ddah[]} ddahs
 * @returns {((string | number)[][])}
 */
export function prepareDdahsSpreadsheet(ddahs: Ddah[]): (string | number)[][] {
    // Compute the maximum number of duties, because each duty gets a column.
    const maxDuties = Math.max(
        ...ddahs.map((ddah) => ddah.duties.length || 0),
        0
    );
    // Create headers for the duty columns
    const dutyHeaders = Array.from({ length: maxDuties * 2 }, (_, i) => {
        if (i % 2 === 0) {
            return `Hours ${i / 2 + 1}`;
        }
        return `Duty ${(i - 1) / 2 + 1}`;
    });

    return [
        ["Position", "Last Name", "First Name", "Assignment Hours", ""].concat(
            dutyHeaders
        ),
    ].concat(
        ddahs.map((ddah) =>
            [
                ddah.assignment.position.position_code,
                ddah.assignment.applicant.last_name,
                ddah.assignment.applicant.first_name,
                ddah.assignment.hours,
                "",
            ].concat(flattenDuties(ddah))
        ) as any[][]
    );
}

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

            // Make a function that converts a list of instructors into a `File` object.
            function prepareData(
                ddahs: Ddah[],
                dataFormat: "csv" | "json" | "xlsx"
            ) {
                // If we have selected specific DDAHs, filter so we only export them.
                if (selectedDdahIds && selectedDdahIds.length > 0) {
                    ddahs = ddahs.filter((d) => selectedDdahIds.includes(d.id));
                }

                return dataToFile(
                    {
                        toSpreadsheet: () => prepareDdahsSpreadsheet(ddahs),
                        toJson: () => ({
                            ddahs: ddahs.map((ddah) =>
                                prepareMinimal.ddah(ddah)
                            ),
                        }),
                    },
                    dataFormat,
                    "ddahs"
                );
            }

            const file = await dispatch(exportDdahs(prepareData, exportType));
            FileSaver.saveAs(file);
        }
        doExport().catch(console.error);
    }, [exportType, dispatch, selectedDdahIds]);

    function onClick(option: "spreadsheet" | "json") {
        setExportType(option);
    }

    return <ExportActionButton onClick={onClick} disabled={disabled} />;
}

/**
 * Convert imported spreadsheet or JSON data into an
 * array of minimal DDAH objects.
 *
 * @param {({
 *     fileType: "json" | "spreadsheet";
 *     data: any;
 * })} data
 * @param {Applicant[]} applicants
 * @returns {MinimalDdah[]}
 */
function normalizeDdahImports(
    data: {
        fileType: "json" | "spreadsheet";
        data: any;
    },
    applicants: Applicant[]
): MinimalDdah[] {
    let ret: MinimalDdah[] = [];

    if (data.fileType === "json") {
        let unwrapped: MinimalDdah[] = data.data;
        if ((unwrapped as any).ddahs) {
            unwrapped = (unwrapped as any).ddahs;
        }
        for (const ddah of unwrapped) {
            ret.push(ddah);
        }
    }

    if (data.fileType === "spreadsheet") {
        const unwrapped = data.data;
        // Get an upper bound for the maximum number of duties that the spreadsheet might have
        const maxDuties = Math.round(
            Math.max(
                ...unwrapped.map((row: object) => Object.keys(row).length),
                0
            ) / 2
        );

        // We need to generate a keymap for all the likely column names
        const keyMap: { [key: string]: string } = {
            Position: "position_code",
            "First Name": "first_name",
            "Given Name": "first_name",
            First: "first_name",
            "Last Name": "last_name",
            Surname: "last_name",
            "Family Name": "last_name",
            Last: "last_name",
        };
        // We will also add `Hours #` and `Duty #` to the keymap for the number of duties in our range
        for (let i = 0; i <= maxDuties; i++) {
            keyMap[`Duty ${i}`] = `duty_${i}`;
            keyMap[`Hours ${i}`] = `hours_${i}`;
            if (i < 10) {
                keyMap[`Duty 0${i}`] = `duty_${i}`;
                keyMap[`Hours 0${i}`] = `hours_${i}`;
            }
        }

        // SpreadsheetRowMapper will perform fuzzy matching of column names for us.
        const rowMapper = new SpreadsheetRowMapper({
            keys: ["position_code", "first_name", "last_name", "utorid"],
            keyMap,
        });

        for (const row of unwrapped) {
            const normalized: {
                [key: string]: any;
            } = rowMapper.formatRow(row);
            if (normalized.utorid == null) {
                // If a UTORid column was not specified, we need to manually search the applicants for
                // someone matching the first/last name. `matchByUtoridOrName` will succeed or throw an error,
                // so if we make it past this line of code, we've successfully found a match.
                const applicant = matchByUtoridOrName(
                    `${normalized.first_name} ${normalized.last_name}`,
                    applicants
                ) as Applicant;
                normalized.utorid = applicant.utorid;
                delete normalized.first_name;
                delete normalized.last_name;
            }
            // Now we need to condense duties to a list
            // The easiest way is to just hunt for them
            const duties: { description: string; hours: number }[] = [];
            for (let i = 0; i <= maxDuties; i++) {
                const duty = normalized[`duty_${i}`];
                const hours = normalized[`hours_${i}`];
                if (duty != null || hours != null) {
                    duties.push({ description: duty || "", hours: hours || 0 });
                    delete normalized[`duty_${i}`];
                    delete normalized[`hours_${i}`];
                }
            }
            ret.push({
                position_code: normalized.position_code,
                applicant: normalized.utorid,
                duties,
            });
        }
    }

    return ret;
}

export function ConnectedImportDdahsAction({ disabled = false }) {
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
    const [inProgress, setInProgress] = React.useState(false);

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

    return (
        <ImportActionButton
            onConfirm={onConfirm}
            onFileChange={setFileContent}
            dialogContent={dialogContent}
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
    const allDdahs = assignments.map((assignment) => {
        if (ddahsByAssignmentId[assignment.id]) {
            return ddahsByAssignmentId[assignment.id];
        }
        return { ...DEFAULT_DDAH, assignment: assignment };
    }) as Ddah[];
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
        ddahsByPosition[position_code] = prepareDdahsSpreadsheet(
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
        const workbook = XLSX.utils.book_new();
        const sheet = XLSX.utils.aoa_to_sheet(array);
        XLSX.utils.book_append_sheet(workbook, sheet, `${position_code} DDAHs`);
        const rawSpreadsheet = XLSX.write(workbook, {
            type: "binary",
            bookType: "xlsx",
        });
        zip.file(`${position_code}-DDAHs.xlsx`, rawSpreadsheet, {
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
