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
import { reduxStoreData } from "./import-export-data/redux-store-data";

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
            keys.forEach((key, i) => (instructor[key] = row[i] ?? null));
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
            instructorSchema,
            false
        );
        expect(normalizedSpreadsheetInstructors).toMatchSnapshot();
        // import correct instructors from JSON
        const normalizedJsonInstructors = normalizeImport(
            {
                fileType: "json",
                data: importObjectJSONs.instructors,
            },
            instructorSchema,
            false
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
                instructorSchema,
                false
            )
        ).toThrow(Error);
    });

    it("Import Applicants from JSON/CSV/XLSX", () => {
        // import correct applicants from CSV
        const normalizedSpreadsheetApplicants = normalizeImport(
            {
                fileType: "spreadsheet",
                data: parseSpreadsheet("applicants_correct.csv"),
            },
            applicantSchema,
            false
        );
        expect(normalizedSpreadsheetApplicants).toMatchSnapshot();
        // import correct applicants from JSON
        const normalizedJsonApplicants = normalizeImport(
            {
                fileType: "json",
                data: importObjectJSONs.applicants,
            },
            applicantSchema,
            false
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
                applicantSchema,
                false
            )
        ).toThrow(Error);
    });
});

it("Import Positions from JSON/CSV/XLSX", () => {
    // import correct positions from XLSX
    let normalizedSpreadsheetPositions = normalizeImport(
        {
            fileType: "spreadsheet",
            data: parseSpreadsheet("positions_correct.xlsx"),
        },
        positionSchema,
        false
    );
    expect(normalizedSpreadsheetPositions).toMatchSnapshot();
    // import correct positions from JSON
    const normalizedJsonPositions = normalizeImport(
        {
            fileType: "json",
            data: importObjectJSONs.positions,
        },
        positionSchema,
        false
    );
    expect(normalizedJsonPositions).toMatchSnapshot();
    // import positions data missing required key utorid should throw error
    expect(() =>
        normalizeImport(
            {
                fileType: "spreadsheet",
                data: parseSpreadsheet("positions_missing_required_keys.xlsx"),
            },
            positionSchema,
            false
        )
    ).toThrow(Error);
    // import positions data with invalid start_date should throw error
    expect(() =>
        normalizeImport(
            {
                fileType: "spreadsheet",
                data: parseSpreadsheet("positions_invalid_date_columns.xlsx"),
            },
            positionSchema,
            false
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
        assignmentSchema,
        false
    );
    expect(normalizedSpreadsheetAssignments).toMatchSnapshot();
    // import correct assignments from JSON
    const normalizedJsonAssignments = normalizeImport(
        {
            fileType: "json",
            data: importObjectJSONs.assignments,
        },
        assignmentSchema,
        false
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
            assignmentSchema,
            false
        )
    ).toThrow(Error);
    // import assignments data with invalid start_date should throw error
    expect(() =>
        normalizeImport(
            {
                fileType: "spreadsheet",
                data: parseSpreadsheet("assignments_invalid_date_columns.xlsx"),
            },
            assignmentSchema,
            false
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
        reduxStoreData.applicants,
        false
    );
    expect(normalizedSpreadsheetDdahs).toMatchSnapshot();
    // import ddahs with invalid applicant should throw error
    expect(() =>
        normalizeDdahImports(
            {
                fileType: "spreadsheet",
                data: parseSpreadsheet("ddahs_invalid_applicant.xlsx"),
            },
            reduxStoreData.applicants,
            false
        )
    ).toThrow(Error);
    // import correct ddahs from JSON
    const normalizedJsonDdahs = normalizeDdahImports(
        {
            fileType: "json",
            data: importObjectJSONs.ddahs,
        },
        [],
        false
    );
    expect(normalizedJsonDdahs).toMatchSnapshot();
});

it.todo("Import Postings from JSON/CSV/XLSX");
it.todo("Export Postings to JSON/CSV/XLSX");

it("Compute Instructors diff", () => {
    // modified instructor data used for computing the diff with initial objects
    const modifiedInstructorData = reduxStoreData.instructors.map(
        prepareMinimal.instructor
    );
    // modify first instructor's email
    modifiedInstructorData[0].email = "new.email@mail.utoronto.ca";
    // add a new instructor
    modifiedInstructorData.push({
        first_name: "Megan",
        last_name: "Miller",
        email: "megan.miller@utoronto.ca",
        utorid: "millerm",
    });
    // compute diff
    const instructorsDiff = diffImport.instructors(
        modifiedInstructorData,
        reduxStoreData
    );
    // modifiedInstructorData instructors should be computed as: modified(email), duplicate, and new
    expect(instructorsDiff).toMatchObject([
        {
            status: "modified",
            changes: { email: expect.any(String) },
        },
        { status: "duplicate" },
        { status: "new" },
    ]);
});

it("Compute Applicants diff", () => {
    // modified applicant data used for computing the diff with initial objects
    const modifiedApplicantData = reduxStoreData.applicants.map(
        prepareMinimal.applicant
    );
    // modify first applicant's email
    modifiedApplicantData[0].email = "new.email@mail.utoronto.ca";
    // add a new applicant
    modifiedApplicantData.push({
        first_name: "Tom",
        last_name: "Jerry",
        email: "jerryt@mail.utoronto.ca",
        phone: null,
        utorid: "jerryt",
        student_number: "777777777",
    });
    // compute diff
    const applicantsDiff = diffImport.applicants(
        modifiedApplicantData,
        reduxStoreData
    );
    // modifiedApplicantData applicants should be computed as: modified(email), duplicate, duplicate, and new
    expect(applicantsDiff).toMatchObject([
        {
            status: "modified",
            changes: {
                email: expect.any(String),
            },
        },
        { status: "duplicate" },
        { status: "duplicate" },
        { status: "new" },
    ]);
});

it("Compute Positions diff", () => {
    // modified position data used for computing the diff with initial objects
    const modifiedPositionData = reduxStoreData.positions.map(
        prepareMinimal.position
    );
    // modify first position's position_title
    modifiedPositionData[0].position_title = "New Title";
    // add a new position
    modifiedPositionData.push({
        position_code: "CSC135H1F",
        position_title: "Computer Fun",
        start_date: "2020-02-10T00:00:00.000Z",
        end_date: "2020-12-31T00:00:00.000Z",
        hours_per_assignment: 75,
        qualifications: null,
        duties: "Tutorials",
        ad_hours_per_assignment: null,
        ad_num_assignments: null,
        ad_open_date: null,
        ad_close_date: null,
        desired_num_assignments: null,
        current_enrollment: null,
        current_waitlisted: null,
        instructors: [],
        contract_template: "Regular",
    });
    // make sure the instructors are valid instructors
    for (const item of modifiedPositionData) {
        item.instructors = diffImport
            .instructorsListFromField(item.instructors || [], {
                instructors: reduxStoreData.instructors,
            })
            .map((x) => x.utorid);
    }
    // compute diff
    const positionsDiff = diffImport.positions(
        modifiedPositionData,
        reduxStoreData
    );
    // modifiedPositionData positions should be computed as: modified(position_title), duplicate, and new
    expect(positionsDiff).toMatchObject([
        {
            status: "modified",
            changes: {
                position_title: expect.any(String),
            },
        },
        { status: "duplicate" },
        { status: "new" },
    ]);
    // positions with invalid instructor should throw error
    const modifiedPositionDataInvalidInstructor = [
        // position with invalid instructor
        {
            position_code: "CSC135H1F",
            position_title: "Computer Fun",
            start_date: "2020-02-10T00:00:00.000Z",
            end_date: "2020-12-31T00:00:00.000Z",
            hours_per_assignment: 75,
            qualifications: null,
            duties: "Tutorials",
            ad_hours_per_assignment: null,
            ad_num_assignments: null,
            ad_open_date: null,
            ad_close_date: null,
            desired_num_assignments: null,
            current_enrollment: null,
            current_waitlisted: null,
            instructors: ["invalid"],
            contract_template: "Regular",
        },
    ];
    expect(() =>
        diffImport.positions(
            modifiedPositionDataInvalidInstructor,
            reduxStoreData
        )
    ).toThrow(Error);
});

it("Compute Assignments diff", () => {
    // modified assignment data used for computing the diff with initial objects
    const modifiedAssignmentData = reduxStoreData.assignments.map(
        prepareMinimal.assignment
    );
    // modify first assignment's wage_chunks
    modifiedAssignmentData[0].wage_chunks = [
        {
            start_date: "2020-01-01T00:00:00.000Z",
            end_date: "2020-03-31T00:00:00.000Z",
            hours: 30,
            rate: 50,
        },
        {
            start_date: "2020-04-01T00:00:00.000Z",
            end_date: "2020-05-01T00:00:00.000Z",
            hours: 40,
            rate: 50,
        },
    ];
    // add a new assignment
    modifiedAssignmentData.push({
        contract_override_pdf: null,
        active_offer_status: null,
        active_offer_recent_activity_date: null,
        contract_template: "regular",
        end_date: "2021-12-10T00:00:00.000Z",
        hours: 80,
        position_code: "CSC494",
        start_date: "2020-12-10T00:00:00.000Z",
        utorid: "wilsonh",
        wage_chunks: [
            {
                end_date: "2020-12-31T00:00:00.000Z",
                hours: 30,
                rate: 50,
                start_date: "2020-12-10T00:00:00.000Z",
            },
            {
                end_date: "2021-06-30T00:00:00.000Z",
                hours: 30,
                rate: 50,
                start_date: "2021-01-01T00:00:00.000Z",
            },
            {
                end_date: "2021-12-10T00:00:00.000Z",
                hours: 20,
                rate: 50,
                start_date: "2021-07-01T00:00:00.000Z",
            },
        ],
    });
    // compute diff
    const assignmentsDiff = diffImport.assignments(
        modifiedAssignmentData,
        reduxStoreData
    );
    // modifiedAssignmentData assignments should be computed as: modified(wage_chunks), duplicate, and new
    expect(assignmentsDiff).toMatchObject([
        {
            status: "modified",
            changes: {
                wage_chunks: expect.any(String),
            },
        },
        {
            status: "duplicate",
        },
        { status: "new" },
    ]);
    // assignments with invalid applicant should throw error
    const modifiedAssignmentDataInvalidApplicant = [
        // assignment with invalid Applicant
        {
            contract_override_pdf: null,
            active_offer_status: null,
            active_offer_recent_activity_date: null,
            contract_template: "regular",
            end_date: "2021-12-10T00:00:00.000Z",
            hours: 80,
            position_code: "CSC494",
            start_date: "2020-12-10T00:00:00.000Z",
            utorid: "invalid",
            wage_chunks: [
                {
                    end_date: "2020-12-31T00:00:00.000Z",
                    hours: 30,
                    rate: 50,
                    start_date: "2020-12-10T00:00:00.000Z",
                },
                {
                    end_date: "2021-06-30T00:00:00.000Z",
                    hours: 30,
                    rate: 50,
                    start_date: "2021-01-01T00:00:00.000Z",
                },
                {
                    end_date: "2021-12-10T00:00:00.000Z",
                    hours: 20,
                    rate: 50,
                    start_date: "2021-07-01T00:00:00.000Z",
                },
            ],
        },
    ];
    expect(() =>
        diffImport.assignments(
            modifiedAssignmentDataInvalidApplicant,
            reduxStoreData
        )
    ).toThrow(Error);
    // assignments with invalid position should throw error
    const modifiedAssignmentDataInvalidPosition = [
        // assignment with invalid position
        {
            contract_override_pdf: null,
            active_offer_status: null,
            active_offer_recent_activity_date: null,
            contract_template: "regular",
            end_date: "2021-12-10T00:00:00.000Z",
            hours: 80,
            position_code: "invalid",
            start_date: "2020-12-10T00:00:00.000Z",
            utorid: "wilsonh",
            wage_chunks: [
                {
                    end_date: "2020-12-31T00:00:00.000Z",
                    hours: 30,
                    rate: 50,
                    start_date: "2020-12-10T00:00:00.000Z",
                },
                {
                    end_date: "2021-06-30T00:00:00.000Z",
                    hours: 30,
                    rate: 50,
                    start_date: "2021-01-01T00:00:00.000Z",
                },
                {
                    end_date: "2021-12-10T00:00:00.000Z",
                    hours: 20,
                    rate: 50,
                    start_date: "2021-07-01T00:00:00.000Z",
                },
            ],
        },
    ];
    expect(() =>
        diffImport.assignments(
            modifiedAssignmentDataInvalidPosition,
            reduxStoreData
        )
    ).toThrow(Error);
});

it("Compute Ddahs diff", () => {
    // modified ddah data used for computing the diff with initial objects
    const modifiedDdahData = reduxStoreData.ddahs.map(prepareMinimal.ddah);
    // modify first ddah's duties
    modifiedDdahData[0].duties = [
        {
            description: "new duty",
            hours: 40,
        },
    ];
    // add a new ddah
    modifiedDdahData.push({
        applicant: "johnd",
        duties: [
            {
                description: "Initial training",
                hours: 30,
            },
            {
                description: "Marking the midterm",
                hours: 50,
            },
        ],
        position_code: "CSC494",
    });
    // compute diff
    const ddahsDiff = diffImport.ddahs(modifiedDdahData, reduxStoreData);
    // modifiedDdahData ddahs should be computed as: modified(duties) and new
    expect(ddahsDiff).toMatchObject([
        {
            status: "modified",
            changes: {
                duties: expect.any(String),
            },
        },
        { status: "new" },
    ]);
    // ddahs with invalid assignment should throw error
    const modifiedDdahDataInvalidAssignment = [
        // ddah with invalid assignment (invalid applicant `potterh` and position `invalid` matching)
        {
            applicant: "potterh",
            duties: [
                {
                    description: "Initial training",
                    hours: 80,
                },
                {
                    description: "Marking the midterm",
                    hours: 10,
                },
                {
                    description: "Running tutorials",
                    hours: 20,
                },
            ],
            position_code: "invalid",
        },
    ];
    expect(() =>
        diffImport.ddahs(modifiedDdahDataInvalidAssignment, reduxStoreData)
    ).toThrow(Error);
});
