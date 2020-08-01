import React from "react";
import FileSaver from "file-saver";
import {
    assignmentsSelector,
    exportAssignments,
    activeSessionSelector,
    applicantsSelector,
    positionsSelector,
    upsertAssignments,
} from "../../api/actions";
import { useSelector, useDispatch } from "react-redux";
import { ExportActionButton } from "../../components/export-button";
import { ImportActionButton } from "../../components/import-button";
import { Alert } from "react-bootstrap";
import { normalizeImport, dataToFile } from "../../libs/importExportUtils";
import {
    AssignmentsList,
    AssignmentsDiffList,
} from "../../components/assignments-list";
import { prepareMinimal } from "../../libs/exportUtils";
import { diffImport, getChanged } from "../../libs/diffUtils";
import { offerTableSelector } from "../offertable/actions";

/**
 * Allows for the download of a file blob containing the exported instructors.
 * Instructors are synchronized from the server before being downloaded.
 *
 * @export
 * @returns
 */
export function ConnectedExportAssignmentsAction({ disabled = false }) {
    const dispatch = useDispatch();
    const session = useSelector(activeSessionSelector);
    const [exportType, setExportType] = React.useState(null);
    const { selectedAssignmentIds } = useSelector(offerTableSelector);

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
            function prepareData(assignments, dataFormat) {
                // If we have selected specific assignments, we only want to export those.
                if (selectedAssignmentIds && selectedAssignmentIds.length > 0) {
                    assignments = assignments.filter((a) =>
                        selectedAssignmentIds.includes(a.id)
                    );
                }

                // We want to flatten a lot of the data in `assignments` and only include the information
                // we need.
                const assignmentsForSpreadsheet = assignments.map(
                    (assignment) => ({
                        first_name: assignment.applicant.first_name,
                        last_name: assignment.applicant.first_name,
                        utorid: assignment.applicant.utorid,
                        position_code: assignment.position.position_code,
                        start_date: assignment.start_date,
                        end_date: assignment.end_date,
                        contract_template: assignment.contract_override_pdf
                            ? null
                            : assignment.position.contract_template
                                  .template_name,
                        contract_override_pdf: assignment.contract_override_pdf,
                        hours: assignment.hours,
                        active_offer_status: assignment.active_offer_status,
                        wage_chunks: assignment.wage_chunks.map((chunk) => ({
                            hours: chunk.hours,
                            rate: chunk.rate,
                            start_date: chunk.start_date,
                            end_date: chunk.end_date,
                        })),
                    })
                );
                return dataToFile(
                    {
                        toSpreadsheet: () =>
                            [
                                [
                                    "Last Name",
                                    "First Name",
                                    "UTORid",
                                    "Position Code",
                                    "Start Date",
                                    "End Date",
                                    "Hours",
                                    "Contract Template",
                                    "Contract Override PDF",
                                    "Offer Status",
                                ],
                            ].concat(
                                assignmentsForSpreadsheet.map((assignment) => [
                                    assignment.first_name,
                                    assignment.last_name,
                                    assignment.utorid,
                                    assignment.position_code,
                                    assignment.start_date &&
                                        new Date(assignment.start_date)
                                            .toJSON()
                                            .slice(0, 10),
                                    assignment.end_date &&
                                        new Date(assignment.end_date)
                                            .toJSON()
                                            .slice(0, 10),
                                    assignment.hours,
                                    assignment.contract_template,
                                    assignment.contract_override_pdf,
                                    assignment.active_offer_status,
                                ])
                            ),
                        toJson: () => ({
                            assignments: assignments.map((assignment) =>
                                prepareMinimal.assignment(assignment, session)
                            ),
                        }),
                    },
                    dataFormat,
                    "assignments"
                );
            }

            const file = await dispatch(
                exportAssignments(prepareData, exportType)
            );

            FileSaver.saveAs(file);
        }
        doExport().catch(console.error);
    }, [exportType, dispatch, session, selectedAssignmentIds]);

    function onClick(option) {
        setExportType(option);
    }

    return <ExportActionButton onClick={onClick} disabled={disabled} />;
}

const assignmentSchema = {
    // We don't list "active_offer_status" because that cannot be imported. It has to be set
    // via the TA or manually by the admin.
    keys: [
        "utorid",
        "position_code",
        "start_date",
        "end_date",
        "contract_template",
        "contract_override_pdf",
        "hours",
        "wage_chunks",
    ],
    keyMap: {
        "Position Code": "position_code",
        "Course Name": "position_code",
        "Start Date": "start_date",
        Start: "start_date",
        "End Date": "end_date",
        End: "end_date",
        Hours: "hours",
        "Contract Override PDF": "contract_override_pdf",
    },
    dateColumns: ["start_date", "end_date"],
    requiredKeys: ["position_code", "utorid"],
    primaryKey: ["utorid", "position_code"],
    baseName: "assignments",
};

export function ConnectedImportAssignmentsAction({ disabled = false }) {
    const dispatch = useDispatch();
    const assignments = useSelector(assignmentsSelector);
    const applicants = useSelector(applicantsSelector);
    const positions = useSelector(positionsSelector);
    const session = useSelector(activeSessionSelector);
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
            let data = normalizeImport(fileContent, assignmentSchema);
            // If data is coming from a spreadsheet, we need to make sure the
            // `hours` field is coerced to a number
            for (const item of data) {
                if (item.hours) {
                    item.hours = +item.hours;
                }
            }

            // Compute which positions have been added/modified
            const newDiff = diffImport.assignments(data, {
                assignments,
                positions,
                applicants,
                session,
            });

            setDiffed(newDiff);
        } catch (e) {
            console.warn(e);
            setProcessingError(e);
        }
    }, [fileContent, assignments, positions, applicants, session, inProgress]);

    async function onConfirm() {
        const changedPositions = getChanged(diffed);
        await dispatch(upsertAssignments(changedPositions));
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
