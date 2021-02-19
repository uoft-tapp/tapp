/**
 * @jest-environment node
 */
import { describe, it, expect } from "./utils";
import {
    validate,
    SpreadsheetRowMapper,
    normalizeImport,
    dataToFile,
} from "../libs/importExportUtils";
import { prepareMinimal } from "../libs/exportUtils";
import XLSX from "xlsx";
import {
    objectJSON,
    instructorSchema,
    applicantSchema,
    positionSchema,
    assignmentSchema,
    ddahSchema,
    instructorData,
    applicantData,
    positionData,
    assignmentData,
    ddahData,
} from "./test-data-collection/test_data";

/* eslint-env node */
function File(fileBits, fileName, options) {
    this.fileBits = fileBits;
    this.fileName = fileName;
    this.options = options;
}
global.File = File;

// Run the actual tests for both the API and the Mock API
describe("Import/export library functionality", () => {
    /**
     * Construct a FileAPI `File` object based on pre-defined object data and input file type
     *
     * @param {string} fileType
     * @param {[object]} objectData
     * @param {string} objectType
     * @param {object} objectSchema
     * @returns {File}
     */
    function getObjectDataFile(objectType, objectData, objectSchema, fileType) {
        return dataToFile(
            {
                toSpreadsheet: () =>
                    [objectSchema.keys].concat(
                        objectData.map((object) =>
                            objectSchema.keys.map((key) => object[key])
                        )
                    ),
                toJson: () => ({
                    [`${objectType}s`]: objectData.map((object) =>
                        prepareMinimal[`${objectType}`](object)
                    ),
                }),
            },
            fileType,
            `${objectType}s`
        );
    }

    /**
     * Given correct object data, object type, correct object schema, and JSON File object,
     * carry out tests to check whether the File object contains correct data.
     *
     * @param {[object]} objectData
     * @param {string} objectType
     * @param {object} objectSchema
     * @param {File} file
     * @returns
     */
    function jsonContainsData(file, objectData, objectSchema, objectType) {
        const correctData = objectData.map((object) =>
            prepareMinimal[`${objectType}`](object)
        );
        // check each object has correct list of keys
        const dataJSON = JSON.parse(file.fileBits.toString())[`${objectType}s`];
        dataJSON.forEach((object) =>
            expect(Object.keys(object)).toEqual(objectSchema.keys)
        );
        // check each object has correct value
        let resultJSON = [];
        for (const object of dataJSON) {
            const newObject = {};
            for (const key of objectSchema.keys) {
                newObject[key] = object[key];
            }
            resultJSON.push(newObject);
        }
        expect(resultJSON).toEqual(correctData);
    }

    /**
     * Given correct object data, object type, correct object schema, and file type,
     * carry out tests to check whether importing from corresponding file containing correct corresponding object data
     * will produce correct object data.
     *
     * @param {[object]} objectData
     * @param {string} objectType
     * @param {object} objectSchema
     * @param {string} fileType
     * @param {string} correctness
     * @returns
     */
    function testImportFromFile(
        objectData,
        objectType,
        objectSchema,
        fileType,
        correctness = ""
    ) {
        if (fileType == "json") {
            // import object data from a JSON file
            const resultJSON = normalizeImport(
                {
                    fileType: "json",
                    data:
                        objectJSON[`${correctness}${objectType}`][
                            `${objectType}s`
                        ],
                },
                objectSchema
            );
            expect(resultJSON).toEqual(objectData);
        } else if (fileType == "spreadsheet") {
            // import object data from a CSV File
            const workbook1 = XLSX.readFile(
                __dirname +
                    `/test-data-collection/${correctness}${objectType}s.csv`
            );
            const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
            let dataCSV = XLSX.utils.sheet_to_json(sheet1, { header: 1 });
            // transform to array of objects
            const keys1 = dataCSV.shift();
            dataCSV = dataCSV.map(function (row) {
                return keys1.reduce(function (obj, key, i) {
                    obj[key] = row[i];
                    return obj;
                }, {});
            });
            const resultCSV = normalizeImport(
                {
                    fileType: "spreadsheet",
                    data: dataCSV,
                },
                objectSchema
            );
            expect(resultCSV).toEqual(objectData);
        }
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
        // export instructor data a CSV File object
        const fileCSV = getObjectDataFile(
            "instructor",
            instructorData,
            instructorSchema,
            "csv"
        );

        // export instructor data to a JSON File object
        const fileJSON = getObjectDataFile(
            "instructor",
            instructorData,
            instructorSchema,
            "json"
        );

        const correctData = instructorData.map((instructor) =>
            prepareMinimal.instructor(instructor)
        );

        jsonContainsData(
            fileJSON,
            instructorData,
            instructorSchema,
            "instructor"
        );

        // import instructor data from a CSV File object
        const workbook1 = XLSX.read(fileCSV.fileBits[0], { type: "array" });
        const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
        let dataCSV = XLSX.utils.sheet_to_json(sheet1, { header: 1 });
        // transform to array of objects
        const keys1 = dataCSV.shift();
        dataCSV = dataCSV.map(function (row) {
            return keys1.reduce(function (obj, key, i) {
                obj[key] = row[i];
                return obj;
            }, {});
        });
        const resultCSV = normalizeImport(
            {
                fileType: "spreadsheet",
                data: dataCSV,
            },
            instructorSchema
        );
        expect(resultCSV).toEqual(correctData);
    });

    it("Import data from a JSON/CSV/XLSX", () => {
        // import from correct instructor files
        testImportFromFile(
            instructorData,
            "instructor",
            instructorSchema,
            "json"
        );
        testImportFromFile(
            instructorData,
            "instructor",
            instructorSchema,
            "spreadsheet"
        );
        // import from correct applicant files
        testImportFromFile(applicantData, "applicant", applicantSchema, "json");
        testImportFromFile(
            applicantData,
            "applicant",
            applicantSchema,
            "spreadsheet"
        );
        // import from correct position files
        testImportFromFile(positionData, "position", positionSchema, "json");
        testImportFromFile(
            positionData,
            "position",
            positionSchema,
            "spreadsheet"
        );
        // import from correct assignment files
        testImportFromFile(
            assignmentData,
            "assignment",
            assignmentSchema,
            "json"
        );
        testImportFromFile(
            assignmentData,
            "assignment",
            assignmentSchema,
            "spreadsheet"
        );
        // import from correct ddah files
        testImportFromFile(ddahData, "ddah", ddahSchema, "json");
        testImportFromFile(ddahData, "ddah", ddahSchema, "spreadsheet");
        // import from files with missing required fields
        expect(() => {
            testImportFromFile(
                positionData,
                "position",
                positionSchema,
                "json",
                "MissPrimaryKey"
            );
        }).toThrow(Error);
        // import from files with invalid date fields
        expect(() => {
            testImportFromFile(
                positionData,
                "position",
                positionSchema,
                "spreadsheet",
                "InvalidDate"
            );
        }).toThrow(Error);
        // import from files with unmatched keys
        expect(() => {
            testImportFromFile(
                positionData,
                "position",
                positionSchema,
                "json",
                "InvalidKey"
            );
        }).toThrow(Error);
    });
});
