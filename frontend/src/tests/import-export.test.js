/**
 * @jest-environment node
 */
import { describe, it, expect } from "./utils";
import {
    validate,
    SpreadsheetRowMapper,
    dataToFile,
    normalizeImport,
} from "../libs/importExportUtils";
import { prepareMinimal } from "../libs/exportUtils";
import XLSX from "xlsx";

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

    const instructorData = [
        {
            id: 2,
            first_name: "Gordon",
            last_name: "Smith",
            email: "a@a.com",
            utorid: "booger",
        },
        {
            id: 3,
            first_name: "Tommy",
            last_name: "Smith",
            email: "a@b.com",
            utorid: "food",
        },
        {
            first_name: "Grandpa",
            last_name: "Boobie",
            email: "a@d.com",
            utorid: "fooc",
        },
    ];

    // variables to store File objects
    let fileCSV;
    let fileJSON;
    let fileXLSX;

    /**
     * Construct a `File` object based on pre-defined instructor data and input file type
     *
     * @param {"xlsx" | "csv" | "json"} dataFormat
     * @returns {File}
     */
    function getInstructorsDataFile(dataFormat) {
        return dataToFile(
            {
                toSpreadsheet: () =>
                    [["Last Name", "First Name", "UTORid", "email"]].concat(
                        instructorData.map((instructor) => [
                            instructor.last_name,
                            instructor.first_name,
                            instructor.utorid,
                            instructor.email,
                        ])
                    ),
                toJson: () => ({
                    instructors: instructorData.map((instructor) =>
                        prepareMinimal.instructor(instructor)
                    ),
                }),
            },
            dataFormat,
            "instructors"
        );
    }

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

    it("Export data to a JSON/CSV/XLSX", () => {
        // export instructor data to a CSV
        fileCSV = getInstructorsDataFile("csv");
        expect(fileCSV.name).toEqual(
            `instructors_export_${new Date().toLocaleDateString("en-CA", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            })}.csv`
        );

        // export instructor data to a JSON
        fileJSON = getInstructorsDataFile("json");
        expect(fileJSON.name).toEqual(
            `instructors_export_${new Date().toLocaleDateString("en-CA", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            })}.json`
        );

        // export instructor data to a XLSX
        fileXLSX = getInstructorsDataFile("spreadsheet");
        expect(fileXLSX.name).toEqual(
            `instructors_export_${new Date().toLocaleDateString("en-CA", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            })}.xlsx`
        );

        // invalid file type, should throw error
        expect(() => getInstructorsDataFile("nonsense")).toThrow(Error);
    });

    it("Import data from a JSON/CSV/XLSX", () => {
        let resultCorrect = instructorData.map((instructor) =>
            prepareMinimal.instructor(instructor)
        );

        // import instructor data from a JSON
        let dataJSON = JSON.parse(fileJSON.buffer.toString()).instructors;
        let resultJSON = normalizeImport(
            {
                fileType: "json",
                data: dataJSON,
            },
            instructorSchema
        );
        expect(resultJSON).toEqual(resultCorrect);

        // import instructor data from a XLSX
        let workbook = XLSX.read(fileXLSX.buffer[0], { type: "array" });
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        let dataXLSX = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // transform to array of objects
        var keys = dataXLSX.shift();
        dataXLSX = dataXLSX.map(function (row) {
            return keys.reduce(function (obj, key, i) {
                obj[key] = row[i];
                return obj;
            }, {});
        });
        let resultXLSX = normalizeImport(
            {
                fileType: "spreadsheet",
                data: dataXLSX,
            },
            instructorSchema
        );
        expect(resultXLSX).toEqual(resultCorrect);

        // import instructor data from a CSV
        let workbook1 = XLSX.read(fileCSV.buffer[0], { type: "array" });
        let sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
        let dataCSV = XLSX.utils.sheet_to_json(sheet1, { header: 1 });
        // transform to array of objects
        var keys1 = dataCSV.shift();
        dataCSV = dataCSV.map(function (row) {
            return keys1.reduce(function (obj, key, i) {
                obj[key] = row[i];
                return obj;
            }, {});
        });
        let resultCSV = normalizeImport(
            {
                fileType: "spreadsheet",
                data: dataCSV,
            },
            instructorSchema
        );
        expect(resultCSV).toEqual(resultCorrect);
    });
});
