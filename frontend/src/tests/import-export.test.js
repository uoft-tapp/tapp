/**
 * @jest-environment node
 */
/* eslint-env node */
import { describe, it, expect } from "./utils";
import {
    validate,
    SpreadsheetRowMapper,
    prepareSpreadsheet,
    normalizeImport,
} from "../libs/importExportUtils";
import {
    instructorData,
    applicantData,
    positionData,
    assignmentData,
    ddahData,
} from "./import-export-data/export-data";
import { prepareMinimal } from "../libs/exportUtils";
import XLSX from "xlsx";
import { objectJSON } from "./import-export-data/import-data";
import { applicantSchema, instructorSchema } from "../libs/schema";

function parseSpreadsheet(fileName) {
    const workbook = XLSX.readFile(
        __dirname + `/import-export-data/${fileName}`
    );
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let dataCSV = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    // transform to array of objects
    const keys = dataCSV.shift();
    dataCSV = dataCSV.map(function (row) {
        return keys.reduce(function (obj, key, i) {
            obj[key] = row[i];
            return obj;
        }, {});
    });
    return dataCSV;
}

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
                data: objectJSON["instructors"],
            },
            instructorSchema
        );
        expect(normalizedJsonInstructors).toMatchSnapshot();
        // import instructors data missing required key utorid
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
                data: objectJSON["applicants"],
            },
            applicantSchema
        );
        expect(normalizedJsonApplicants).toMatchSnapshot();
        // import applicants data missing required key utorid
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
    });
});
