/**
 * @jest-environment node
 */
/* eslint-env node */
import { describe, it, expect, parseSpreadsheet } from "./utils";
import {
    instructorData,
    applicantData,
    positionData,
    assignmentData,
    ddahData,
} from "./import-export-data/export-data";
import XLSX from "xlsx";
import { importObjectJSONs } from "./import-export-data/import-data";
import {
    applicantSchema,
    instructorSchema,
    positionSchema,
    assignmentSchema,
} from "../libs/schema";
import { diffImport } from "../libs/diffs";
import {
    prepareInstructorData,
    prepareMinimal,
    validate,
    prepareSpreadsheet,
    SpreadsheetRowMapper,
    normalizeImport,
    normalizeDdahImports,
} from "../libs/import-export";
import {
    existingObjectsForInstructorImport,
    existingObjectsForApplicantImport,
    existingObjectsForPositionImport,
    existingObjectsNoInstructorForPositionImport,
    existingObjectsForAssignmentImport,
    existingObjectsNoApplicantForAssignmentImport,
    existingObjectsNoPositionForAssignmentImport,
    existingApplicantsForDdahImport,
    existingObjectsForDdahImport,
    existingObjectsNoAssignmentForDdahImport,
} from "./import-export-data/existing-objects-for-import";

// create a shim for native File object for export round trip test
function File(fileBits, fileName, options) {
    this.fileBits = fileBits;
    this.fileName = fileName;
    this.options = options;
}
global.File = File;

// Run the actual tests for both the API and the Mock API
describe("Import/export library functionality", () => {
    it("Validate data according to a schema", () => {
        // Should not throw
        expect(() => validate(instructorData, instructorSchema)).not.toThrow(
            Error
        );
        // Should throw
        expect(() =>
            validate(
                [
                    ...instructorData,
                    { first_name: "You", last_name: "Me", email: "t@b.com" },
                ],
                instructorSchema
            )
        ).toThrow(Error);
    });

    it("Fuzzy matching of spreadsheet column names based on schema", () => {
        let rowMapper;
        const targetData = { first_name: "Joe", last_name: "Smith" };

        // Matches keys specified in the schema
        // `rowMapper` needs to be redefined each time it is used with different column names because of the way it caches lookups
        rowMapper = new SpreadsheetRowMapper(instructorSchema);
        expect(
            rowMapper.formatRow(
                { first_name: "Joe", last_name: "Smith" },
                false
            )
        ).toEqual(targetData);

        // Matches keys specified in the keyMap
        rowMapper = new SpreadsheetRowMapper(instructorSchema);
        expect(
            rowMapper.formatRow(
                { "First Name": "Joe", "Last Name": "Smith" },
                false
            )
        ).toEqual(targetData);

        // Fuzzy matches
        rowMapper = new SpreadsheetRowMapper(instructorSchema);
        expect(
            rowMapper.formatRow(
                { "First  Name": "Joe", LastName: "Smith" },
                false
            )
        ).toEqual(targetData);
        rowMapper = new SpreadsheetRowMapper(instructorSchema);
        expect(
            rowMapper.formatRow(
                { firstname: "Joe", "LAST NAMEE": "Smith" },
                false
            )
        ).toEqual(targetData);

        // Fails to match column names that are too far different from the original
        rowMapper = new SpreadsheetRowMapper(instructorSchema);
        expect(
            rowMapper.formatRow({ name: "Joe", "LAST NAME": "Smith" }, false)
        ).not.toEqual(targetData);
    });

    it("Export Instructors to JSON/CSV/XLSX", () => {
        // prepare instructor spreadsheet
        const instructorSpreadsheet = prepareSpreadsheet.instructor(
            instructorData
        );
        expect(instructorSpreadsheet).toMatchSnapshot();

        // prepare instructor json
        const instructorJson = instructorData.map(prepareMinimal.instructor);
        expect(instructorJson).toMatchSnapshot();

        // ROUND TRIP TEST for prepareData function
        // create instructor CSV File object
        const instructorCSV = prepareInstructorData(instructorData, "csv");
        // according to File API docs, File object constructor takes an array of ArrayBuffer, etc as the file content.
        // since Node does not recognize File object, we created a shim for File
        // thus we take fileBits[0] to retrieve the ArrayBuffer
        const workbook = XLSX.read(instructorCSV.fileBits[0], {
            type: "array",
        });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        let dataCSV = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const keys = dataCSV.shift();
        // transform to array of objects
        dataCSV = dataCSV.map(function (row) {
            let instructor = {};
            keys.forEach((key, i) => (instructor[key] = row[i]));
            return instructor;
        });
        // check with original instructor data
        expect(dataCSV).toMatchSnapshot();
    });

    it("Export Applicants to JSON/CSV/XLSX", () => {
        // prepare applicant spreadsheet
        const applicantSpreadsheet = prepareSpreadsheet.applicant(
            applicantData
        );
        expect(applicantSpreadsheet).toMatchSnapshot();

        // prepare applicant json
        const applicantJson = applicantData.map(prepareMinimal.applicant);
        expect(applicantJson).toMatchSnapshot();
    });

    it("Export Positions to JSON/CSV/XLSX", () => {
        // prepare position spreadsheet
        const positionSpreadsheet = prepareSpreadsheet.position(positionData);
        expect(positionSpreadsheet).toMatchSnapshot();

        // prepare position json
        const positionJson = positionData.map(prepareMinimal.position);
        expect(positionJson).toMatchSnapshot();
    });

    it("Export Assignments to JSON/CSV/XLSX", () => {
        // prepare assignment spreadsheet
        const assignmentSpreadsheet = prepareSpreadsheet.assignment(
            assignmentData
        );
        expect(assignmentSpreadsheet).toMatchSnapshot();

        // prepare assignment json
        const assignmentJson = assignmentData.map(function (assignment) {
            return prepareMinimal.assignment(assignment, {
                rate: 50,
                rate1: 50,
                rate2: 50,
            });
        });
        expect(assignmentJson).toMatchSnapshot();
    });

    it("Export Ddahs to JSON/CSV/XLSX", () => {
        // prepare ddah spreadsheet
        const ddahSpreadsheet = prepareSpreadsheet.ddah(ddahData);
        expect(ddahSpreadsheet).toMatchSnapshot();

        // prepare ddah json
        const ddahJson = ddahData.map(prepareMinimal.ddah);
        expect(ddahJson).toMatchSnapshot();
    });

    it("Import Instructors from JSON/CSV/XLSX", () => {
        // import correct instructors from XLSX
        const normalizedSpreadsheetInstructors = normalizeImport(
            {
                fileType: "spreadsheet",
                data: parseSpreadsheet("instructors_correct.xlsx"),
            },
            instructorSchema
        );
        expect(normalizedSpreadsheetInstructors).toMatchSnapshot();
        // import correct instructors from JSON
        const normalizedJsonInstructors = normalizeImport(
            {
                fileType: "json",
                data: importObjectJSONs.instructors,
            },
            instructorSchema
        );
        expect(normalizedJsonInstructors).toMatchSnapshot();
        // import instructors data missing required key utorid should throw error
        expect(() =>
            normalizeImport(
                {
                    fileType: "spreadsheet",
                    data: parseSpreadsheet(
                        "instructors_missing_required_keys.xlsx"
                    ),
                },
                instructorSchema
            ).toThrow(Error)
        );
        // compute the difference between existing instructors
        const instructorsDiff = diffImport.instructors(
            normalizedSpreadsheetInstructors,
            existingObjectsForInstructorImport
        );
        expect(instructorsDiff).toMatchSnapshot();
    });

    it("Import Applicants from JSON/CSV/XLSX", () => {
        // import correct applicants from CSV
        const normalizedSpreadsheetApplicants = normalizeImport(
            {
                fileType: "spreadsheet",
                data: parseSpreadsheet("applicants_correct.csv"),
            },
            applicantSchema
        );
        expect(normalizedSpreadsheetApplicants).toMatchSnapshot();
        // import correct applicants from JSON
        const normalizedJsonApplicants = normalizeImport(
            {
                fileType: "json",
                data: importObjectJSONs.applicants,
            },
            applicantSchema
        );
        expect(normalizedJsonApplicants).toMatchSnapshot();
        // import applicants data missing required key utorid should throw error
        expect(() =>
            normalizeImport(
                {
                    fileType: "spreadsheet",
                    data: parseSpreadsheet(
                        "applicants_missing_required_keys.csv"
                    ),
                },
                applicantSchema
            ).toThrow(Error)
        );
        // compute the difference between existing applicants
        const applicantsDiff = diffImport.applicants(
            normalizedSpreadsheetApplicants,
            existingObjectsForApplicantImport
        );
        expect(applicantsDiff).toMatchSnapshot();
    });
});

it("Import Positions from JSON/CSV/XLSX", () => {
    // import correct positions from XLSX
    let normalizedSpreadsheetPositions = normalizeImport(
        {
            fileType: "spreadsheet",
            data: parseSpreadsheet("positions_correct.xlsx"),
        },
        positionSchema
    );
    expect(normalizedSpreadsheetPositions).toMatchSnapshot();
    // import correct positions from JSON
    const normalizedJsonPositions = normalizeImport(
        {
            fileType: "json",
            data: importObjectJSONs.positions,
        },
        positionSchema
    );
    expect(normalizedJsonPositions).toMatchSnapshot();
    // import positions data missing required key utorid should throw error
    expect(() =>
        normalizeImport(
            {
                fileType: "spreadsheet",
                data: parseSpreadsheet("positions_missing_required_keys.xlsx"),
            },
            positionSchema
        ).toThrow(Error)
    );
    // import positions data with invalid start_date should throw error
    expect(() =>
        normalizeImport(
            {
                fileType: "spreadsheet",
                data: parseSpreadsheet("positions_invalid_date_columns.xlsx"),
            },
            positionSchema
        ).toThrow(Error)
    );
    // make sure the instructors are valid instructors
    for (const item of normalizedSpreadsheetPositions) {
        item.instructors = diffImport
            .instructorsListFromField(item.instructors || [], {
                instructors: existingObjectsForPositionImport.instructors,
            })
            .map((x) => x.utorid);
    }
    // compute the difference with existing positions
    const positionsDiff = diffImport.positions(
        normalizedSpreadsheetPositions,
        existingObjectsForPositionImport
    );
    expect(positionsDiff).toMatchSnapshot();
    // import positions assigned to invalid instructors should throw error
    expect(() =>
        diffImport.positions(
            normalizedSpreadsheetPositions,
            existingObjectsNoInstructorForPositionImport
        )
    ).toThrow(Error);
});

it("Import Assignments from JSON/CSV/XLSX", () => {
    // import correct assignments from XLSX
    let normalizedSpreadsheetAssignments = normalizeImport(
        {
            fileType: "spreadsheet",
            data: parseSpreadsheet("assignments_correct.xlsx"),
        },
        assignmentSchema
    );
    expect(normalizedSpreadsheetAssignments).toMatchSnapshot();
    // import correct assignments from JSON
    const normalizedJsonAssignments = normalizeImport(
        {
            fileType: "json",
            data: importObjectJSONs.assignments,
        },
        assignmentSchema
    );
    expect(normalizedJsonAssignments).toMatchSnapshot();
    // import assignments data missing required key utorid should throw error
    expect(() =>
        normalizeImport(
            {
                fileType: "spreadsheet",
                data: parseSpreadsheet(
                    "assignments_missing_required_keys.xlsx"
                ),
            },
            assignmentSchema
        ).toThrow(Error)
    );
    // import assignments data with invalid start_date should throw error
    expect(() =>
        normalizeImport(
            {
                fileType: "spreadsheet",
                data: parseSpreadsheet("assignments_invalid_date_columns.xlsx"),
            },
            assignmentSchema
        ).toThrow(Error)
    );
    // Compute the difference with existing assignments
    const assignmentsDiff = diffImport.assignments(
        normalizedJsonAssignments,
        existingObjectsForAssignmentImport
    );
    expect(assignmentsDiff).toMatchSnapshot();
    // import assignments with invalid applicant should throw error
    expect(() =>
        diffImport.assignments(
            normalizedJsonAssignments,
            existingObjectsNoApplicantForAssignmentImport
        )
    ).toThrow(Error);
    // import assignments with invalid position should throw error
    expect(() =>
        diffImport.assignments(
            normalizedJsonAssignments,
            existingObjectsNoPositionForAssignmentImport
        )
    ).toThrow(Error);
});

it("Import Ddahs from JSON/CSV/XLSX", () => {
    // import correct ddahs from XLSX
    let normalizedSpreadsheetDdahs = normalizeDdahImports(
        {
            fileType: "spreadsheet",
            data: parseSpreadsheet("ddahs_correct.xlsx"),
        },
        existingApplicantsForDdahImport
    );
    expect(normalizedSpreadsheetDdahs).toMatchSnapshot();
    // import ddahs with invalid applicant should throw error
    expect(() =>
        normalizeDdahImports(
            {
                fileType: "spreadsheet",
                data: parseSpreadsheet("ddahs_invalid_applicant.xlsx"),
            },
            existingApplicantsForDdahImport
        )
    ).toThrow(Error);
    // import correct ddahs from JSON
    const normalizedJsonDdahs = normalizeDdahImports(
        {
            fileType: "json",
            data: importObjectJSONs.ddahs,
        },
        []
    );
    expect(normalizedJsonDdahs).toMatchSnapshot();
    // Compute the difference with existing ddahs
    const ddahsDiff = diffImport.ddahs(
        normalizedJsonDdahs,
        existingObjectsForDdahImport
    );
    expect(ddahsDiff).toMatchSnapshot();
    // import ddah with invalid assignment should throw error
    expect(() =>
        diffImport.ddahs(
            normalizedJsonDdahs,
            existingObjectsNoAssignmentForDdahImport
        )
    ).toThrow(Error);
});
