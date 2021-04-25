import React from "react";
import FileSaver from "file-saver";
import {
    instructorsSelector,
    positionsSelector,
    exportPositions,
    contractTemplatesSelector,
    upsertPositions,
} from "../../../api/actions";
import { useSelector } from "react-redux";
import { ExportActionButton } from "../../../components/export-button";
import { ImportActionButton } from "../../../components/import-button";
import { Alert } from "react-bootstrap";
import {
    ExportFormat,
    normalizeImport,
    preparePositionData,
} from "../../../libs/import-export";
import {
    PositionsList,
    PositionsDiffList,
} from "../../../components/positions-list";
import { diffImport, DiffSpec, getChanged } from "../../../libs/diffs";
import { positionSchema } from "../../../libs/schema";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { MinimalPosition, Position } from "../../../api/defs/types";
import type { DataFormat } from "../../../libs/import-export/normalize-import";

/**
 * Allows for the download of a file blob containing the exported instructors.
 * Instructors are synchronized from the server before being downloaded.
 *
 * @export
 * @returns
 */
export function ConnectedExportPositionsAction({
    disabled,
}: {
    disabled: boolean;
}) {
    const dispatch = useThunkDispatch();
    const [exportType, setExportType] = React.useState<ExportFormat | null>(
        null
    );

    React.useEffect(() => {
        if (!exportType) {
            return;
        }

        async function doExport() {
            if (exportType == null) {
                return;
            }
            // Having an export type of `null` means we're ready to export again,
            // We set the export type to null at the start so in case an error occurs,
            // we can still try again. This *will not* affect the current value of `exportType`
            setExportType(null);

            const file = await dispatch(
                exportPositions(preparePositionData, exportType)
            );

            FileSaver.saveAs(file);
        }
        doExport().catch(console.error);
    }, [exportType, dispatch]);

    function onClick(option: ExportFormat) {
        setExportType(option);
    }

    return <ExportActionButton onClick={onClick} disabled={disabled} />;
}

export function ConnectedImportPositionsAction({
    disabled,
    setImportInProgress = null,
}: {
    disabled: boolean;
    setImportInProgress?: Function | null;
}) {
    const dispatch = useThunkDispatch();
    const positions = useSelector(positionsSelector);
    const instructors = useSelector(instructorsSelector);
    const contractTemplates = useSelector(contractTemplatesSelector);
    const [fileContent, setFileContent] = React.useState<DataFormat | null>(
        null
    );
    const [diffed, setDiffed] = React.useState<
        DiffSpec<MinimalPosition, Position>[] | null
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
        if (!fileContent || inProgress) {
            return;
        }
        try {
            setProcessingError(null);

            // normalize the data coming from the file
            let data = normalizeImport(fileContent, positionSchema);
            // `normalizeImport` only normalizes the column names and dates. We need to make sure the
            // instructors are correct as well.
            for (const item of data) {
                item.instructors = diffImport
                    .instructorsListFromField(item.instructors || [], {
                        instructors,
                    })
                    .map((x) => x.utorid);
            }

            // Compute which positions have been added/modified
            const newDiff = diffImport.positions(data as MinimalPosition[], {
                positions,
                instructors,
                contractTemplates,
            });

            setDiffed(newDiff);
        } catch (e) {
            console.warn(e);
            setProcessingError(e);
        }
    }, [fileContent, positions, contractTemplates, instructors, inProgress]);

    async function onConfirm() {
        if (diffed == null) {
            throw new Error("Cannot import null data");
        }
        const changedPositions = getChanged(diffed);
        await dispatch(upsertPositions(changedPositions));
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
    diffed: DiffSpec<MinimalPosition, Position>[] | null;
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
                    No difference between imported positions and those already
                    on the system.
                </Alert>
            );
        } else {
            dialogContent = (
                <>
                    {newItems.length > 0 && (
                        <Alert variant="primary">
                            <span className="mb-1">
                                The following positions will be{" "}
                                <strong>added</strong>
                            </span>
                            <PositionsList positions={newItems} />
                        </Alert>
                    )}
                    {modifiedDiffSpec.length > 0 && (
                        <Alert variant="info">
                            <span className="mb-1">
                                The following positions will be{" "}
                                <strong>modified</strong>
                            </span>
                            <PositionsDiffList
                                modifiedPositions={modifiedDiffSpec}
                            />
                        </Alert>
                    )}
                </>
            );
        }
    }

    return dialogContent;
});
