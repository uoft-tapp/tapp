/*
 * A collection of modified objects
 * used for computing difference with initial objects.
 */

export const modifiedInstructorData = [
    {
        email: "hery.smith@utoronto.ca",
        first_name: "Henry",
        last_name: "Smith",
        utorid: "smithh",
    },
    {
        email: "gordon.smith@utoronto.ca",
        first_name: "戈登",
        utorid: "smithhg",
    },
    {
        email: "megan.miller@utoronto.ca",
        first_name: "Miller",
        last_name: "Miles",
        utorid: "millerm",
    },
];

export const modifiedApplicantData = [
    {
        email: "goofy-duck@donald.com",
        first_name: "John",
        last_name: "Doe",
        phone: "4166666666",
        student_number: "10000000",
        utorid: "johnd",
    },
    {
        email: undefined,
        first_name: "Ron",
        last_name: "Weasley",
        phone: undefined,
        student_number: undefined,
        utorid: "weasleyr",
    },
    {
        email: "harry@potter.com",
        first_name: "哈利",
        last_name: "Potter",
        phone: "41888888888",
        student_number: "999666999",
        utorid: "potterh",
    },
];

export const modifiedPositionData = [
    {
        contract_template: "Regular",
        current_enrollment: undefined,
        current_waitlisted: undefined,
        desired_num_assignments: undefined,
        duties: "",
        end_date: "2020-05-01T00:00:00.000Z",
        hours_per_assignment: 20,
        instructors: "",
        position_code: "CSC494",
        position_title: "Capstone Project",
        qualifications: "",
        start_date: "2020-01-01T00:00:00.000Z",
    },
    {
        contract_template: "Regular",
        current_enrollment: undefined,
        current_waitlisted: undefined,
        desired_num_assignments: undefined,
        duties: "",
        end_date: "2020-12-31T00:00:00.000Z",
        hours_per_assignment: 70,
        instructors: "Garcia, Emily; Smith, Henry",
        position_code: "MAT136H1F",
        position_title: "代数",
        qualifications: "",
        start_date: "2020-02-10T00:00:00.000Z",
    },
    {
        contract_template: "Regular",
        current_enrollment: undefined,
        current_waitlisted: undefined,
        desired_num_assignments: undefined,
        duties: "Tutorials",
        end_date: "2020-12-31T00:00:00.000Z",
        hours_per_assignment: 75,
        instructors: "Smith, Henry",
        position_code: "CSC135H1F",
        position_title: "Computer Fun",
        qualifications: "",
        start_date: "2020-02-10T00:00:00.000Z",
    },
];

export const modifiedPositionDataInvalidInstructor = [
    {
        contract_template: "Regular",
        current_enrollment: undefined,
        current_waitlisted: undefined,
        desired_num_assignments: undefined,
        duties: "",
        end_date: "2020-12-31T00:00:00.000Z",
        hours_per_assignment: 70,
        instructors: "Invalid, Instructor",
        position_code: "MAT136H1F",
        position_title: "代数",
        qualifications: "",
        start_date: "2020-02-10T00:00:00.000Z",
    },
];

export const modifiedAssignmentData = [
    {
        contract_override_pdf: null,
        contract_template: "regular",
        end_date: "2021-12-10T00:00:00.000Z",
        hours: 80,
        position_code: "CSC494",
        start_date: "2020-12-10T00:00:00.000Z",
        utorid: "potterh",
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
    {
        contract_override_pdf: null,
        contract_template: "regular",
        end_date: "2021-12-10T00:00:00.000Z",
        hours: 100,
        position_code: "CSC494",
        start_date: "2020-12-10T00:00:00.000Z",
        utorid: "weasleyr",
        wage_chunks: [
            {
                end_date: "2020-12-31T00:00:00.000Z",
                hours: 30,
                rate: 50,
                start_date: "2020-12-10T00:00:00.000Z",
            },
            {
                end_date: "2021-06-30T00:00:00.000Z",
                hours: 10,
                rate: 50,
                start_date: "2021-01-01T00:00:00.000Z",
            },
            {
                end_date: "2021-12-10T00:00:00.000Z",
                hours: 30,
                rate: 50,
                start_date: "2021-07-01T00:00:00.000Z",
            },
        ],
    },
    {
        contract_override_pdf: null,
        contract_template: "regular",
        end_date: "2021-12-10T00:00:00.000Z",
        hours: 80,
        position_code: "CSC494",
        start_date: "2020-12-10T00:00:00.000Z",
        utorid: "doej",
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

export const modifiedAssignmentDataInvalidApplicant = [
    {
        contract_override_pdf: null,
        contract_template: "regular",
        end_date: "2021-12-10T00:00:00.000Z",
        hours: 80,
        position_code: "CSC494",
        start_date: "2020-12-10T00:00:00.000Z",
        utorid: "invalidapplicant",
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

export const modifiedAssignmentDataInvalidPosition = [
    {
        contract_override_pdf: null,
        contract_template: "regular",
        end_date: "2021-12-10T00:00:00.000Z",
        hours: 80,
        position_code: "invalidcourse",
        start_date: "2020-12-10T00:00:00.000Z",
        utorid: "potterh",
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

export const modifiedDdahData = [
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
        position_code: "CSC135H1F",
    },
];

export const modifiedDdahDataInvalidAssignment = [
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
