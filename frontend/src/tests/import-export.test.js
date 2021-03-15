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
import XLSX from "xlsx";
import { objectJSON } from "./import-export-data/import-data";
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
    parseSpreadsheet,
    normalizeDdahImports,
} from "../libs/import-export";

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
                data: objectJSON["instructors"],
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
            {
                instructors: [
                    // instructor to be modified
                    {
                        first_name: "Henry",
                        utorid: "smithh",
                        email: "OLD@utoronto.ca",
                    },
                    // instructor to be duplicated
                    {
                        email: "gordon.smith@utoronto.ca",
                        first_name: "戈登",
                        last_name: "Smith",
                        utorid: "smithhg",
                    },
                ],
            }
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
                data: objectJSON["applicants"],
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
            {
                applicants: [
                    // applicant to be modified
                    {
                        first_name: "John",
                        last_name: "Doe",
                        utorid: "johnd",
                        email: "goofy-duck@donald.com",
                        student_number: "OLD10000000",
                    },
                    // applicant to be duplicated
                    {
                        first_name: "哈利",
                        last_name: "Potter",
                        utorid: "potterh",
                        email: "harry@potter.com",
                        student_number: "999666999",
                        phone: "41888888888",
                    },
                ],
            }
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
            data: objectJSON["positions"],
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
    for (const item of normalizedSpreadsheetPositions) {
        item.instructors = diffImport
            .instructorsListFromField(item.instructors || [], {
                instructors: [
                    {
                        first_name: "Henry",
                        last_name: "Smith",
                        utorid: "smithh",
                    },
                    {
                        first_name: "Emily",
                        last_name: "Garcia",
                        utorid: "garciae",
                    },
                ],
            })
            .map((x) => x.utorid);
    }
    // compute the difference with existing positions
    const positionsDiff = diffImport.positions(normalizedSpreadsheetPositions, {
        positions: [
            {
                position_code: "MAT136H1F",
                position_title: "代数",
                hours_per_assignment: 70,
                start_date: "2020-02-10T00:00:00.000Z",
                end_date: "2020-12-31T00:00:00.000Z",
                instructors: [
                    {
                        first_name: "Henry",
                        last_name: "Smith",
                        utorid: "smithh",
                    },
                    {
                        first_name: "Emily",
                        last_name: "Garcia",
                        utorid: "garciae",
                    },
                ],
                contract_template: {
                    template_name: "Regular",
                },
                duties: "",
                qualifications: "",
            },
            {
                position_code: "CSC494",
                position_title: "Capstone Project",
                hours_per_assignment: 20,
                start_date: "2020-02-10T00:00:00.000Z",
                end_date: "2020-12-31T00:00:00.000Z",
                instructors: [
                    {
                        first_name: "Henry",
                        last_name: "Smith",
                        utorid: "smithh",
                    },
                    {
                        first_name: "Emily",
                        last_name: "Garcia",
                        utorid: "garciae",
                    },
                ],
                contract_template: {
                    template_name: "Regular",
                },
                duties: "",
                qualifications: "",
            },
        ],
        instructors: [
            {
                first_name: "Henry",
                last_name: "Smith",
                utorid: "smithh",
            },
            {
                first_name: "Emily",
                last_name: "Garcia",
                utorid: "garciae",
            },
        ],
        contractTemplates: [
            {
                template_name: "Regular",
            },
        ],
    });
    expect(positionsDiff).toMatchSnapshot();
    // import positions assigned to invalid instructors should throw error
    expect(() =>
        diffImport.positions(normalizedSpreadsheetPositions, {
            positions: [],
            instructors: [
                {
                    first_name: "Emily",
                    last_name: "Garcia",
                    utorid: "garciae",
                },
            ],
            contractTemplates: [
                {
                    template_name: "Regular",
                },
            ],
        })
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
            data: objectJSON["assignments"],
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
    const assignmentsDiff = diffImport.assignments(normalizedJsonAssignments, {
        assignments: [
            {
                applicant: {
                    first_name: "Harry",
                    last_name: "Potter",
                    email: "a@a.com",
                    utorid: "potterh",
                    phone: "41666666666",
                    student_number: "1000000000",
                },
                position: {
                    position_code: "CSC494",
                    position_title: "Capstone Project",
                    hours_per_assignment: 70,
                    start_date: "2020-12-10T00:00:00.000Z",
                    end_date: "2021-12-10T00:00:00.000Z",
                    duties: "mark assignments",
                    qualifications: "3 300-lvl CSC courses",
                    ad_hours_per_assignment: null,
                    ad_num_assignments: null,
                    ad_open_date: null,
                    ad_close_date: null,
                    desired_num_assignments: 20,
                    current_enrollment: 400,
                    current_waitlisted: 100,
                    instructors: [],
                    contract_template: {
                        template_name: "Regular",
                    },
                },
                start_date: "2020-12-10T00:00:00.000Z",
                end_date: "2021-12-10T00:00:00.000Z",
                contract_override_pdf: null,
                hours: 80,
                active_offer_status: null,
                active_offer_recent_activity_date: null,
                // more than 2 wage_chunks
                wage_chunks: [
                    {
                        hours: 30,
                        rate: 50,
                        start_date: "2020-12-10T00:00:00.000Z",
                        end_date: "2020-12-31T00:00:00.000Z",
                    },
                    {
                        hours: 30,
                        rate: 50,
                        start_date: "2021-01-01T00:00:00.000Z",
                        end_date: "2021-06-30T00:00:00.000Z",
                    },
                    {
                        hours: 20,
                        rate: 50,
                        start_date: "2021-07-01T00:00:00.000Z",
                        end_date: "2021-12-10T00:00:00.000Z",
                    },
                ],
            },
        ],
        positions: [
            {
                position_code: "CSC494",
                position_title: "Capstone Project",
                hours_per_assignment: 70,
                start_date: "2020-12-10T00:00:00.000Z",
                end_date: "2021-12-10T00:00:00.000Z",
                duties: "mark assignments",
                qualifications: "3 300-lvl CSC courses",
                ad_hours_per_assignment: null,
                ad_num_assignments: null,
                ad_open_date: null,
                ad_close_date: null,
                desired_num_assignments: 20,
                current_enrollment: 400,
                current_waitlisted: 100,
                instructors: [],
                contract_template: {
                    template_name: "Regular",
                },
            },
        ],
        applicants: [
            {
                first_name: "Harry",
                last_name: "Potter",
                email: "a@a.com",
                utorid: "potterh",
                phone: "41666666666",
                student_number: "1000000000",
            },
            { first_name: "Ron", last_name: "Weasley", utorid: "weasleyr" },
        ],
        session: { rate: 50, rate1: 50, rate2: 50, rate3: 50 },
    });
    expect(assignmentsDiff).toMatchSnapshot();
    // import assignments with invalid applicant should throw error
    expect(() =>
        diffImport.assignments(normalizedJsonAssignments, {
            assignments: [],
            positions: [
                {
                    position_code: "CSC494",
                    position_title: "Capstone Project",
                    hours_per_assignment: 70,
                    start_date: "2020-12-10T00:00:00.000Z",
                    end_date: "2021-12-10T00:00:00.000Z",
                    duties: "mark assignments",
                    qualifications: "3 300-lvl CSC courses",
                    ad_hours_per_assignment: null,
                    ad_num_assignments: null,
                    ad_open_date: null,
                    ad_close_date: null,
                    desired_num_assignments: 20,
                    current_enrollment: 400,
                    current_waitlisted: 100,
                    instructors: [],
                    contract_template: {
                        template_name: "Regular",
                    },
                },
            ],
            applicants: [],
            session: { rate: 50, rate1: 50, rate2: 50, rate3: 50 },
        })
    ).toThrow(Error);
    // import assignments with invalid position should throw error
    expect(() =>
        diffImport.assignments(normalizedJsonAssignments, {
            assignments: [],
            positions: [],
            applicants: [
                {
                    first_name: "Harry",
                    last_name: "Potter",
                    email: "a@a.com",
                    utorid: "potterh",
                    phone: "41666666666",
                    student_number: "1000000000",
                },
                { first_name: "Ron", last_name: "Weasley", utorid: "weasleyr" },
            ],
            session: { rate: 50, rate1: 50, rate2: 50, rate3: 50 },
        })
    ).toThrow(Error);
});

it("Import Ddahs from JSON/CSV/XLSX", () => {
    // import correct ddahs from XLSX
    let normalizedSpreadsheetDdahs = normalizeDdahImports(
        {
            fileType: "spreadsheet",
            data: parseSpreadsheet("ddahs_correct.xlsx"),
        },
        [
            {
                first_name: "Hanna",
                last_name: "Wilson",
                email: "wilsonh@mail.utoronto.ca",
                utorid: "wilsonh",
                phone: "41666666666",
                student_number: "1000000000",
            },
        ]
    );
    expect(normalizedSpreadsheetDdahs).toMatchSnapshot();
    // import ddahs with invalid applicant should throw error
    expect(() =>
        normalizeDdahImports(
            {
                fileType: "spreadsheet",
                data: parseSpreadsheet("ddahs_invalid_applicant.xlsx"),
            },
            [
                {
                    first_name: "Hanna",
                    last_name: "Wilson",
                    email: "wilsonh@mail.utoronto.ca",
                    utorid: "wilsonh",
                    phone: "41666666666",
                    student_number: "1000000000",
                },
            ]
        )
    ).toThrow(Error);
    // import correct ddahs from JSON
    const normalizedJsonDdahs = normalizeDdahImports(
        {
            fileType: "json",
            data: objectJSON["ddahs"],
        },
        []
    );
    expect(normalizedJsonDdahs).toMatchSnapshot();
    // Compute the difference with existing ddahs
    const ddahsDiff = diffImport.ddahs(normalizedJsonDdahs, {
        ddahs: [
            {
                assignment: {
                    applicant: {
                        first_name: "Harry",
                        last_name: "Potter",
                        email: "a@a.com",
                        utorid: "potterh",
                        phone: "41666666666",
                        student_number: "1000000000",
                    },
                    position: {
                        position_code: "CSC135H1F",
                        hours_per_assignment: 70,
                        start_date: "2020-12-10T00:00:00.000Z",
                        end_date: "2021-12-10T00:00:00.000Z",
                        duties: "mark assignments",
                        qualifications: "3 300-lvl CSC courses",
                        instructors: [],
                        contract_template: {
                            template_name: "Regular",
                        },
                    },
                    start_date: "2020-12-10T00:00:00.000Z",
                    end_date: "2021-12-10T00:00:00.000Z",
                    contract_override_pdf: null,
                    hours: 80,
                    active_offer_status: null,
                    active_offer_recent_activity_date: null,
                    // more than 2 wage_chunks
                    wage_chunks: [
                        {
                            hours: 30,
                            rate: 50,
                            start_date: "2020-12-10T00:00:00.000Z",
                            end_date: "2020-12-31T00:00:00.000Z",
                        },
                        {
                            hours: 30,
                            rate: 50,
                            start_date: "2021-01-01T00:00:00.000Z",
                            end_date: "2021-06-30T00:00:00.000Z",
                        },
                        {
                            hours: 20,
                            rate: 50,
                            start_date: "2021-07-01T00:00:00.000Z",
                            end_date: "2021-12-10T00:00:00.000Z",
                        },
                    ],
                },
                duties: [
                    {
                        description: "Initial training",
                        hours: 80,
                    },
                    {
                        description: "Marking the midterm",
                        hours: 50,
                    },
                ],
            },
        ],
        assignments: [
            {
                applicant: {
                    first_name: "Harry",
                    last_name: "Potter",
                    email: "a@a.com",
                    utorid: "potterh",
                    phone: "41666666666",
                    student_number: "1000000000",
                },
                position: {
                    position_code: "CSC135H1F",
                    hours_per_assignment: 70,
                    start_date: "2020-12-10T00:00:00.000Z",
                    end_date: "2021-12-10T00:00:00.000Z",
                    duties: "mark assignments",
                    qualifications: "3 300-lvl CSC courses",
                    instructors: [],
                    contract_template: {
                        template_name: "Regular",
                    },
                },
                start_date: "2020-12-10T00:00:00.000Z",
                end_date: "2021-12-10T00:00:00.000Z",
                contract_override_pdf: null,
                hours: 80,
                active_offer_status: null,
                active_offer_recent_activity_date: null,
                // more than 2 wage_chunks
                wage_chunks: [
                    {
                        hours: 30,
                        rate: 50,
                        start_date: "2020-12-10T00:00:00.000Z",
                        end_date: "2020-12-31T00:00:00.000Z",
                    },
                    {
                        hours: 30,
                        rate: 50,
                        start_date: "2021-01-01T00:00:00.000Z",
                        end_date: "2021-06-30T00:00:00.000Z",
                    },
                    {
                        hours: 20,
                        rate: 50,
                        start_date: "2021-07-01T00:00:00.000Z",
                        end_date: "2021-12-10T00:00:00.000Z",
                    },
                ],
            },
        ],
    });
    expect(ddahsDiff).toMatchSnapshot();
});
