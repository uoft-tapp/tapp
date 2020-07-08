import React from "react";
import FileSaver from "file-saver";
import {
    instructorsSelector,
    exportInstructors,
    upsertInstructors,
} from "../../api/actions";
import { useSelector, useDispatch } from "react-redux";
import { ExportActionButton } from "../../components/export-button";
import { ImportActionButton } from "../../components/import-button";
import {
    InstructorsList,
    InstructorsDiffList,
} from "../../components/instructors";
import { Alert } from "react-bootstrap";
import { normalizeImport, dataToFile } from "../../libs/importExportUtils";
import { prepareMinimal } from "../../libs/exportUtils";
import { diffImport, getChanged } from "../../libs/diffUtils";

/**
 * Allows for the download of a file blob containing the exported instructors.
 * Instructors are synchronized from the server before being downloaded.
 *
 * @export
 * @returns
 */
export function ConnectedExportInstructorsAction() {
    const dispatch = useDispatch();
    const [exportType, setExportType] = React.useState(null);

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
            function prepareData(instructors, dataFormat) {
                return dataToFile(
                    {
                        toSpreadsheet: () =>
                            [
                                ["Last Name", "First Name", "UTORid", "email"],
                            ].concat(
                                instructors.map((instructor) => [
                                    instructor.last_name,
                                    instructor.first_name,
                                    instructor.utorid,
                                    instructor.email,
                                ])
                            ),
                        toJson: () => ({
                            instructors: instructors.map((instructor) =>
                                prepareMinimal.instructor(instructor)
                            ),
                        }),
                    },
                    dataFormat,
                    "instructors"
                );
            }

            const file = await dispatch(
                exportInstructors(prepareData, exportType)
            );

            FileSaver.saveAs(file);
        }
        doExport().catch(console.error);
    }, [exportType, dispatch]);

    function onClick(option) {
        setExportType(option);
    }

    return <ExportActionButton onClick={onClick} />;
}

const instructorSchema = {
    keys: ["first_name", "last_name", "utorid", "email"],
    keyMap: {
        "First Name": "first_name",
        "Given Name": "first_name",
        First: "first_name",
        "Last Name": "last_name",
        Surname: "last_name",
        "Family Name": "last_name",
        Last: "last_name",
    },
    requiredKeys: ["utorid"],
    primaryKey: "utorid",
    dateColumns: [],
    baseName: "instructors",
};

export function ConnectedImportInstructorAction() {
    const dispatch = useDispatch();
    const instructors = useSelector(instructorsSelector);
    const [fileContent, setFileContent] = React.useState(null);
    const [diffed, setDiffed] = React.useState(null);
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
            const data = normalizeImport(fileContent, instructorSchema);
            // Compute which instructors have been added/modified
            const newDiff = diffImport.instructors(data, { instructors });

            setDiffed(newDiff);
        } catch (e) {
            console.warn(e);
            setProcessingError(e);
        }
    }, [fileContent, instructors, inProgress]);

    async function onConfirm() {
        const changedInstructors = getChanged(diffed);

        await dispatch(upsertInstructors(changedInstructors));

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
                    No difference between imported instructors and those already
                    on the system.
                </Alert>
            );
        } else {
            dialogContent = (
                <>
                    {newItems.length > 0 && (
                        <Alert variant="primary">
                            <span className="mb-1">
                                The following instructors will be{" "}
                                <strong>added</strong>
                            </span>
                            <InstructorsList instructors={newItems} />
                        </Alert>
                    )}
                    {modifiedDiffSpec.length > 0 && (
                        <Alert variant="info">
                            <span className="mb-1">
                                The following instructors will be{" "}
                                <strong>modified</strong>
                            </span>
                            <InstructorsDiffList
                                modifiedInstructors={modifiedDiffSpec}
                            />
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
        />
    );
}
