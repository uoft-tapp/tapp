import React from "react";
import FileSaver from "file-saver";
import {
    assignmentsSelector,
    exportAssignments,
    activeSessionSelector,
    applicantsSelector,
    positionsSelector,
    upsertAssignments,
} from "../../../api/actions";
import { useSelector } from "react-redux";
import { ExportActionButton } from "../../../components/export-button";
import { ImportActionButton } from "../../../components/import-button";
import { Alert } from "react-bootstrap";
import {
    ExportFormat,
    normalizeImport,
    prepareAssignmentDataFactory,
} from "../../../libs/import-export";
import {
    AssignmentsList,
    AssignmentsDiffList,
} from "../../../components/assignments-list";
import { diffImport, DiffSpec, getChanged } from "../../../libs/diffs";
import { offerTableSelector } from "../offertable/actions";
import { assignmentSchema } from "../../../libs/schema";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { Assignment, MinimalAssignment } from "../../../api/defs/types";

/**
 * Allows for the download of a file blob containing the exported instructors.
 * Instructors are synchronized from the server before being downloaded.
 *
 * @export
 * @returns
 */
export function ConnectedExportAssignmentsAction({
    disabled = false,
    setExportInProgress = null,
}: {
    disabled: boolean;
    setExportInProgress: Function | null;
}) {
    const dispatch = useThunkDispatch();
    const session = useSelector(activeSessionSelector);
    const [exportType, setExportType] = React.useState<ExportFormat | null>(
        null
    );
    const { selectedAssignmentIds } = useSelector(offerTableSelector);

    const setInProgress = React.useCallback(
        function setInProgress(val) {
            if (typeof setExportInProgress === "function") {
                setExportInProgress(val);
            }
        },
        [setExportInProgress]
    );

    React.useEffect(() => {
        if (!exportType || !session) {
            return;
        }

        async function doExport() {
            if (!session || !exportType) {
                return;
            }
            // Having an export type of `null` means we're ready to export again,
            // We set the export type to null at the start so in case an error occurs,
            // we can still try again. This *will not* affect the current value of `exportType`
            setExportType(null);

            setInProgress(true);
            const file = await dispatch(
                exportAssignments(
                    prepareAssignmentDataFactory(
                        session,
                        (assignments, selectedIds = selectedAssignmentIds) => {
                            // If we have selected specific assignments, we only want to export those.
                            if (selectedIds && selectedIds.length > 0) {
                                assignments = assignments.filter((a) =>
                                    selectedIds.includes(a.id)
                                );
                            }
                            return assignments;
                        }
                    ),
                    exportType
                )
            );
            setInProgress(false);

            FileSaver.saveAs(file);
        }
        doExport().catch(console.error);
    }, [exportType, dispatch, session, selectedAssignmentIds, setInProgress]);

    function onClick(option: ExportFormat) {
        setExportType(option);
    }

    return <ExportActionButton onClick={onClick} disabled={disabled} />;
}

/**
 *
 *
 * @export
 * @param {*} {
 *     disabled = false,
 *     setImportInProgress: null | Function,
 * }
 * @returns
 */
export function ConnectedImportAssignmentsAction({
    disabled = false,
    setImportInProgress = null,
}: {
    disabled: boolean;
    setImportInProgress: Function | null;
}) {
    const dispatch = useThunkDispatch();
    const assignments = useSelector(assignmentsSelector);
    const applicants = useSelector(applicantsSelector);
    const positions = useSelector(positionsSelector);
    const session = useSelector(activeSessionSelector);
    const [fileContent, setFileContent] = React.useState(null);
    const [diffed, setDiffed] = React.useState<
        DiffSpec<MinimalAssignment, Assignment>[] | null
    >(null);
    const [processingError, setProcessingError] = React.useState(null);
    const [inProgress, _setInProgress] = React.useState(false);

    function setInProgress(state: any) {
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
        if (!fileContent || !session || inProgress) {
            return;
        }
        try {
            setProcessingError(null);

            // normalize the data coming from the file
            let data = normalizeImport(
                fileContent,
                assignmentSchema
            ) as MinimalAssignment[];
            // If data is coming from a spreadsheet, we need to make sure the
            // `hours` field is coerced to a number
            for (const item of data) {
                if (item.hours) {
                    item.hours = +item.hours;
                }
            }

            // Compute which assignments have been added/modified
            const newDiff = diffImport.assignments(data, {
                assignments,
                positions,
                applicants,
                session,
            });

            setDiffed(newDiff);
        } catch (e: any) {
            console.warn(e);
            setProcessingError(e);
        }
    }, [fileContent, assignments, positions, applicants, session, inProgress]);

    async function onConfirm() {
        if (!diffed) {
            return;
        }
        const changedPositions = getChanged(diffed);
        await dispatch(upsertAssignments(changedPositions));
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

const DialogContent = React.memo(function DialogContent({
    diffed,
    processingError,
}: {
    diffed: DiffSpec<MinimalAssignment, Assignment>[] | null;
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
                    No difference between imported assignments and those already
                    on the system.
                </Alert>
            );
        } else {
            dialogContent = (
                <>
                    {newItems.length > 0 && (
                        <Alert variant="primary">
                            <span className="mb-1">
                                The following assignments will be{" "}
                                <strong>added</strong>
                            </span>
                            <AssignmentsList assignments={newItems} />
                        </Alert>
                    )}
                    {modifiedDiffSpec.length > 0 && (
                        <Alert variant="info">
                            <span className="mb-1">
                                The following assignments will be{" "}
                                <strong>modified</strong>
                            </span>
                            <AssignmentsDiffList
                                modifiedAssignments={modifiedDiffSpec}
                            />
                        </Alert>
                    )}
                </>
            );
        }
    }

    return dialogContent;
});
