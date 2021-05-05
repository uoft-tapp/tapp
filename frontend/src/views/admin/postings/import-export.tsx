import React from "react";
import FileSaver from "file-saver";
import {
    exportPosting,
    positionsSelector,
    upsertPosting,
} from "../../../api/actions";
import { ExportActionButton } from "../../../components/export-button";
import {
    DataFormat,
    normalizeImport,
    prepareFull,
    preparePostingData,
} from "../../../libs/import-export";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { useSelector } from "react-redux";
import { MinimalPosting, Posting } from "../../../api/defs/types";
import { postingSchema } from "../../../libs/schema";
import { ImportActionButton } from "../../../components/import-button";
import { Alert } from "react-bootstrap";

/**
 * Allows for the download of a file blob containing the exported posting.
 * Postings are synchronized from the server before being downloaded.
 *
 * @export
 * @returns
 */
export function ConnectedExportPostingsAction({
    postingId,
}: {
    postingId: number;
}) {
    const dispatch = useThunkDispatch();
    const [exportType, setExportType] = React.useState<
        "spreadsheet" | "json" | null
    >(null);

    React.useEffect(() => {
        if (!exportType) {
            return;
        }

        async function doExport() {
            // Having an export type of `null` means we're ready to export again,
            // We set the export type to null at the start so in case an error occurs,
            // we can still try again. This *will not* affect the current value of `exportType`
            setExportType(null);
            if (exportType == null) {
                throw new Error(`Unknown export type ${exportType}`);
            }

            const file = await dispatch(
                exportPosting(postingId, preparePostingData, exportType)
            );

            FileSaver.saveAs(file as any);
        }
        doExport().catch(console.error);
    }, [exportType, dispatch, postingId]);

    function onClick(option: "spreadsheet" | "json") {
        setExportType(option);
    }

    return <ExportActionButton onClick={onClick} />;
}

export function ConnectedImportPostingAction({
    disabled,
    setImportInProgress = null,
}: {
    disabled: boolean;
    setImportInProgress?: Function | null;
}) {
    const dispatch = useThunkDispatch();
    const positions = useSelector(positionsSelector);
    const [fileContent, setFileContent] = React.useState<DataFormat | null>(
        null
    );
    const [newPostings, setNewPostings] = React.useState<
        Omit<Posting, "id">[] | null
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
            if (newPostings) {
                setNewPostings(null);
            }
        }
    }, [newPostings, setNewPostings, fileContent]);

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
            let data = normalizeImport(fileContent, postingSchema);

            // Postings aren't like other types of imports because they're "2d".  That
            // means only one posting fits in a spreadsheet and the posting_positions span
            // multiple rows. The rest of the data is all in the top row. E.g., a spreadsheet
            // might look like:
            //
            //   name | open_date | close_date | position_name | num_position | hours | ...
            //   XXX  | Jan 1, 21 | Jan 2, 21  | MAT111        | 4            | 70    | ...
            //        |           |            | MAT123        | 99           | 50    |
            //        |           |            | CSC444        | 10           | 30    |
            //
            // Because of this, if we load from a spreadsheet, we need to accumulate all rows together.
            // If we load from JSON, we need to delete the unused keys.

            const firstRow = data[0];
            if (Array.isArray(firstRow?.posting_positions)) {
                // If we're here, we imported from JSON.
                data = data.map((row) => {
                    // These attributes are included by the schema but are not used when importing JSON
                    delete row.hours;
                    delete row.num_positions;
                    delete row.position_code;
                    return row;
                });
            } else {
                // If we're here, we are importing from a spreadsheet
                const postingPositions = data.map((row) => ({
                    position_code: row.position_code,
                    num_positions: row.num_positions,
                    hours: row.hours,
                }));
                // A spreadsheet contains information about exactly one posting. Most relevant fields are in
                // the first row.
                const postingData = data[0];
                delete postingData.hours;
                delete postingData.num_positions;
                delete postingData.position_code;
                postingData.posting_positions = postingPositions;
                try {
                    postingData.custom_questions = JSON.parse(
                        postingData.custom_questions
                    );
                } catch (e) {
                    throw new Error(
                        `Could not parse JSON data for custom questions (${e})`
                    );
                }
                data = [postingData];
            }

            console.log("THE DATA", data);
            setNewPostings(
                data.map((minPosting) =>
                    prepareFull.posting(minPosting as MinimalPosting, {
                        positions,
                    })
                )
            );
        } catch (e) {
            console.warn(e);
            setProcessingError(e);
        }
    }, [fileContent, positions, inProgress]);

    async function onConfirm() {
        if (newPostings == null) {
            throw new Error("Cannot import null data");
        }
        await Promise.all(
            newPostings.map((posting) => dispatch(upsertPosting(posting)))
        );
        setFileContent(null);
    }

    return (
        <ImportActionButton
            onConfirm={onConfirm}
            onFileChange={setFileContent}
            dialogContent={
                <DialogContent
                    newPostings={newPostings}
                    processingError={processingError}
                />
            }
            setInProgress={setInProgress}
            disabled={disabled}
        />
    );
}

const DialogContent = React.memo(function DialogContent({
    newPostings,
    processingError,
}: {
    newPostings: Omit<Posting, "id">[] | null;
    processingError: string | null;
}) {
    let dialogContent = <p>No data loaded...</p>;
    if (processingError) {
        dialogContent = <Alert variant="danger">{"" + processingError}</Alert>;
    } else if (newPostings) {
        if (newPostings.length === 0) {
            dialogContent = (
                <Alert variant="warning">No imported postings detected.</Alert>
            );
        } else {
            dialogContent = (
                <React.Fragment>
                    <Alert variant="primary">
                        <span className="mb-1">
                            The following postings will be{" "}
                            <strong>added</strong>
                        </span>
                    </Alert>
                    {newPostings.map((posting) => (
                        <React.Fragment key={posting.name}>
                            <div>
                                <b>Name:</b> {posting.name}
                            </div>
                            <div>
                                <b>Open Date:</b> {posting.open_date}
                            </div>
                            <div>
                                <b>Close Date:</b> {posting.close_date}
                            </div>
                            <div>
                                <b>Intro Text:</b> {posting.intro_text}
                            </div>
                            <h4>Posting Positions</h4>
                            <ul>
                                {posting.posting_positions.map(
                                    (postingPosition) => (
                                        <li
                                            key={
                                                postingPosition.position
                                                    .position_code
                                            }
                                        >
                                            {
                                                postingPosition.position
                                                    .position_code
                                            }{" "}
                                            (
                                            {postingPosition.num_positions ||
                                                "?"}{" "}
                                            positions at{" "}
                                            {postingPosition.hours || "?"}{" "}
                                            hours)
                                        </li>
                                    )
                                )}
                            </ul>
                            <div>
                                <b>Custom Questions:</b>{" "}
                                {JSON.stringify(posting.custom_questions)}
                            </div>
                            <hr />
                        </React.Fragment>
                    ))}
                </React.Fragment>
            );
        }
    }

    return dialogContent;
});
