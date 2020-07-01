/**
 * @jest-environment node
 */
import { describe, it, expect } from "./utils";
import { validate, SpreadsheetRowMapper } from "../libs/importExportUtils";

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

    it.todo("Export data to a JSON/CSV/XLSX");
    it.todo("Import data from a JSON/CSV/XLSX");
});
