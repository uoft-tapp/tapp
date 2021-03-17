import { dataToFile } from "./data-to-file";
import { prepareSpreadsheet } from "./prepare-spreadsheet";
import { prepareMinimal } from "./prepare-json";

/**
 * Make a function that converts a list of applicants into a `File` object.
 *
 * @export
 * @param {Applicant[]} applicants
 * @param {"csv" | "json" | "xlsx"} dataFormat
 * @returns
 */
export function prepareApplicantData(applicants, dataFormat) {
    return dataToFile(
        {
            toSpreadsheet: () => prepareSpreadsheet.applicant(applicants),
            toJson: () => ({
                applicants: applicants.map((applicant) =>
                    prepareMinimal.applicant(applicant)
                ),
            }),
        },
        dataFormat,
        "applicants"
    );
}

/**
 * A factory function which produces assignment prepareData function,
 *
 * @export
 * @param {Session} session
 * @param {Function | null} assignmentFilter
 * @returns {Function}
 */
export function prepareAssignmentDataFactory(session, assignmentFilter = null) {
    // Make a function that converts a list of assignments into a `File` object.
    return function prepareData(assignments, dataFormat) {
        if (assignmentFilter instanceof Function) {
            assignments = assignmentFilter(assignments);
        }
        return dataToFile(
            {
                toSpreadsheet: () => prepareSpreadsheet.assignment(assignments),
                toJson: () => ({
                    assignments: assignments.map((assignment) =>
                        prepareMinimal.assignment(assignment, session)
                    ),
                }),
            },
            dataFormat,
            "assignments"
        );
    };
}

/**
 * A factory function which produces ddah prepareData function,
 *
 * @export
 * @param {Function | null} ddahFilter
 * @returns {Function}
 */
export function prepareDdahDataFactory(ddahFilter) {
    // Make a function that converts a list of ddahs into a `File` object.
    return function prepareData(ddahs, dataFormat) {
        if (ddahFilter instanceof Function) {
            ddahs = ddahFilter(ddahs);
        }
        return dataToFile(
            {
                toSpreadsheet: () => prepareSpreadsheet.ddah(ddahs),
                toJson: () => ({
                    ddahs: ddahs.map((ddah) => prepareMinimal.ddah(ddah)),
                }),
            },
            dataFormat,
            "ddahs"
        );
    };
}

/**
 * Make a function that converts a list of instructors into a `File` object.
 *
 * @export
 * @param {Instructor[]} instructors
 * @param {"csv" | "json" | "xlsx"} dataFormat
 * @returns
 */
export function prepareInstructorData(instructors, dataFormat) {
    return dataToFile(
        {
            toSpreadsheet: () => prepareSpreadsheet.instructor(instructors),
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

/**
 * Make a function that converts a list of positions into a `File` object.
 *
 * @export
 * @param {Position[]} positions
 * @param {"csv" | "json" | "xlsx"} dataFormat
 * @returns
 */
export function preparePositionData(positions, dataFormat) {
    return dataToFile(
        {
            toSpreadsheet: () => prepareSpreadsheet.position(positions),
            toJson: () => ({
                positions: positions.map((position) =>
                    prepareMinimal.position(position)
                ),
            }),
        },
        dataFormat,
        "positions"
    );
}
