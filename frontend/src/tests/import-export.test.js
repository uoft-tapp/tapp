/**
 * @jest-environment node
 */
/* eslint-env node */
import { describe, it, expect } from "./utils";
import {
    instructorData,
    applicantData,
    positionData,
    assignmentData,
    ddahData,
} from "./import-export-data/export-data";
import {
    prepareInstructorData,
    prepareMinimal,
    validate,
    prepareSpreadsheet,
    SpreadsheetRowMapper,
} from "../libs/import-export";
import XLSX from "xlsx";

// create a shim for native File object
function File(fileBits, fileName, options) {
    this.fileBits = fileBits;
    this.fileName = fileName;
    this.options = options;
}
global.File = File;

// Run the actual tests for both the API and the Mock API
describe("Import/export library functionality", () => {
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
    };

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
        // fileBits[0] stores the ArrayBuffer object of exported instructors data
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
});
