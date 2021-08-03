import React from "react";
import FileSaver from "file-saver";
import { activeSessionSelector, exportAssignments } from "../../../api/actions";
import { ExportActionButton } from "../../../components/export-button";
import { prepareAssignmentDataFactory } from "../../../libs/import-export";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { useSelector } from "react-redux";
import { activePositionSelector } from "../store/actions";
import { Applicant, Assignment, Position } from "../../../api/defs/types";

/**
 * Slice a date string to only include the YYYY-MM-DD part.
 */
function truncDate(date: string): string {
    return date.slice(0, 10);
}

/**
 * Create a JSON export containing assignment information and applicant information
 * for assignments corresponding to `position`
 *
 * @param {Position} position
 * @returns
 */
function jsonOutputForPosition(position: Position) {
    return function makeJsonOutput(assignments: Assignment[]) {
        assignments = assignments.filter(
            (assignment) => assignment.position.id === position.id
        );
        const applicantsHash: Record<string, Applicant> = {};
        for (const assignment of assignments) {
            applicantsHash[assignment.applicant.utorid] = assignment.applicant;
        }
        const data = {
            assignments: assignments.map((assignment) => ({
                utorid: assignment.applicant.utorid,
                position_code: assignment.position.position_code,
                hours: assignment.hours,
                start_date: truncDate(assignment.start_date),
                end_date: truncDate(assignment.end_date),
                status: assignment.active_offer_status,
                wage_chunks: assignment.wage_chunks?.map((wageChunk) => ({
                    hours: wageChunk.hours,
                    start_date: truncDate(wageChunk.start_date),
                    end_date: truncDate(wageChunk.end_date),
                    rate: wageChunk.rate,
                })),
            })),
            applicants: Object.values(applicantsHash).map((applicant) => ({
                utorid: applicant.utorid,
                student_number: applicant.student_number,
                first_name: applicant.first_name,
                last_name: applicant.last_name,
                email: applicant.email,
            })),
            positions: [
                {
                    position_code: position.position_code,
                    position_title: position.position_title,
                    start_date: truncDate(position.start_date),
                    end_date: truncDate(position.end_date),
                    current_enrollment: position.current_enrollment,
                    current_waitlisted: position.current_waitlisted,
                    duties: position.duties,
                    qualifications: position.qualifications,
                    instructors: position.instructors.map((instructor) => ({
                        first_name: instructor.first_name,
                        last_name: instructor.last_name,
                        email: instructor.email,
                    })),
                },
            ],
        };

        const file = new File(
            [JSON.stringify(data, null, 4)],
            `${position.position_code}.json`,
            {
                type: "application/json",
            }
        );
        return file;
    };
}

/**
 * Allows for the download of a file blob containing the exported instructors.
 * Instructors are synchronized from the server before being downloaded.
 *
 * @export
 * @returns
 */
export function ConnectedExportAssignmentsAction() {
    const dispatch = useThunkDispatch();
    const [exportType, setExportType] = React.useState<
        "spreadsheet" | "json" | null
    >(null);
    const session = useSelector(activeSessionSelector);
    const activePosition = useSelector(activePositionSelector);

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
            if (!session) {
                throw new Error("Must have a session selected to export data");
            }
            if (!activePosition) {
                throw new Error("Must have a position selected to export data");
            }

            if (exportType === "json") {
                const file = await dispatch(
                    exportAssignments(
                        jsonOutputForPosition(activePosition),
                        exportType
                    )
                );

                FileSaver.saveAs(file as any);
            } else {
                const file = await dispatch(
                    exportAssignments(
                        prepareAssignmentDataFactory(session, (assignments) =>
                            assignments.filter(
                                (assignment) =>
                                    assignment.position.id === activePosition.id
                            )
                        ),
                        exportType
                    )
                );

                FileSaver.saveAs(file as any);
            }
        }
        doExport().catch(console.error);
    }, [exportType, dispatch, activePosition, session]);

    function onClick(option: "spreadsheet" | "json") {
        setExportType(option);
    }

    return <ExportActionButton onClick={onClick} />;
}
