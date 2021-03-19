/*
 * A collection of initial objects and modified objects
 * used for testing diff functionalities
 */

// a collection of initial instructors, applicants, positions, assignments, ddahs
// used for computing the diff with modified objects
export const initialObjects = {
    instructors: [
        {
            first_name: "Henry",
            utorid: "smithh",
            last_name: "Smith",
            email: "OLD@utoronto.ca",
        },
        {
            email: "gordon.smith@utoronto.ca",
            first_name: "Gordon",
            last_name: "Smith",
            utorid: "smithhg",
        },
    ],
    applicants: [
        {
            first_name: "John",
            last_name: "Doe",
            utorid: "johnd",
            email: "goofy-duck@donald.com",
            student_number: "OLD10000000",
            phone: null,
        },
        {
            first_name: "Harry",
            last_name: "Potter",
            utorid: "potterh",
            email: "harry@potter.com",
            student_number: "999666999",
            phone: "41888888888",
        },
        {
            first_name: "Hanna",
            last_name: "Wilson",
            email: "wilsonh@mail.utoronto.ca",
            utorid: "wilsonh",
            phone: "41666666666",
            student_number: "1000000001",
        },
    ],
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
                    utorid: "smithh",
                    last_name: "Smith",
                    email: "OLD@utoronto.ca",
                },
                {
                    email: "gordon.smith@utoronto.ca",
                    first_name: "Gordon",
                    last_name: "Smith",
                    utorid: "smithhg",
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
            hours_per_assignment: 80,
            start_date: "2020-02-10T00:00:00.000Z",
            end_date: "2020-12-31T00:00:00.000Z",
            instructors: [
                {
                    first_name: "Henry",
                    utorid: "smithh",
                    last_name: "Smith",
                    email: "OLD@utoronto.ca",
                },
                {
                    email: "gordon.smith@utoronto.ca",
                    first_name: "Gordon",
                    last_name: "Smith",
                    utorid: "smithhg",
                },
            ],
            contract_template: {
                template_name: "Regular",
            },
            duties: "",
            qualifications: "",
        },
    ],
    contractTemplates: [
        {
            template_name: "Regular",
        },
    ],
    assignments: [
        {
            applicant: {
                first_name: "Harry",
                last_name: "Potter",
                utorid: "potterh",
                email: "harry@potter.com",
                student_number: "999666999",
                phone: "41888888888",
            },
            position: {
                position_code: "CSC494",
                position_title: "Capstone Project",
                hours_per_assignment: 80,
                start_date: "2020-12-10T00:00:00.000Z",
                end_date: "2021-12-10T00:00:00.000Z",
                instructors: [
                    {
                        first_name: "Henry",
                        utorid: "smithh",
                        last_name: "Smith",
                        email: "OLD@utoronto.ca",
                    },
                    {
                        email: "gordon.smith@utoronto.ca",
                        first_name: "Gordon",
                        last_name: "Smith",
                        utorid: "smithhg",
                    },
                ],
                contract_template: {
                    template_name: "Regular",
                },
                duties: "",
                qualifications: "",
            },
            start_date: "2020-12-10T00:00:00.000Z",
            end_date: "2021-12-10T00:00:00.000Z",
            contract_override_pdf: null,
            hours: 80,
            active_offer_status: null,
            active_offer_recent_activity_date: null,
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
        {
            applicant: {
                first_name: "John",
                last_name: "Doe",
                utorid: "johnd",
                email: "goofy-duck@donald.com",
                student_number: "OLD10000000",
                phone: null,
            },
            position: {
                position_code: "CSC494",
                position_title: "Capstone Project",
                hours_per_assignment: 80,
                start_date: "2020-12-10T00:00:00.000Z",
                end_date: "2021-12-10T00:00:00.000Z",
                instructors: [
                    {
                        first_name: "Henry",
                        utorid: "smithh",
                        last_name: "Smith",
                        email: "OLD@utoronto.ca",
                    },
                    {
                        email: "gordon.smith@utoronto.ca",
                        first_name: "Gordon",
                        last_name: "Smith",
                        utorid: "smithhg",
                    },
                ],
                contract_template: {
                    template_name: "Regular",
                },
                duties: "",
                qualifications: "",
            },
            start_date: "2020-12-10T00:00:00.000Z",
            end_date: "2021-12-10T00:00:00.000Z",
            contract_override_pdf: null,
            hours: 80,
            active_offer_status: null,
            active_offer_recent_activity_date: null,
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
    session: { rate: 50, rate1: 50, rate2: 50, rate3: 50 },
    ddahs: [
        {
            assignment: {
                applicant: {
                    first_name: "Harry",
                    last_name: "Potter",
                    utorid: "potterh",
                    email: "harry@potter.com",
                    student_number: "999666999",
                    phone: "41888888888",
                },
                position: {
                    position_code: "CSC494",
                    position_title: "Capstone Project",
                    hours_per_assignment: 80,
                    start_date: "2020-12-10T00:00:00.000Z",
                    end_date: "2021-12-10T00:00:00.000Z",
                    instructors: [
                        {
                            first_name: "Henry",
                            utorid: "smithh",
                            last_name: "Smith",
                            email: "OLD@utoronto.ca",
                        },
                        {
                            email: "gordon.smith@utoronto.ca",
                            first_name: "Gordon",
                            last_name: "Smith",
                            utorid: "smithhg",
                        },
                    ],
                    contract_template: {
                        template_name: "Regular",
                    },
                    duties: "",
                    qualifications: "",
                },
                start_date: "2020-12-10T00:00:00.000Z",
                end_date: "2021-12-10T00:00:00.000Z",
                contract_override_pdf: null,
                hours: 80,
                active_offer_status: null,
                active_offer_recent_activity_date: null,
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
                    hours: 30,
                },
                {
                    description: "Marking the midterm",
                    hours: 50,
                },
            ],
        },
    ],
};

// modified instructor data used for computing the diff with initial objects
export const modifiedInstructorData = [
    // instructor who modified email
    {
        first_name: "Henry",
        utorid: "smithh",
        last_name: "Smith",
        email: "henry.smith@utoronto.ca",
    },
    // duplicate instructor
    {
        email: "gordon.smith@utoronto.ca",
        first_name: "Gordon",
        last_name: "Smith",
        utorid: "smithhg",
    },
    // new instructor
    {
        email: "megan.miller@utoronto.ca",
        first_name: "Miller",
        last_name: "Miles",
        utorid: "millerm",
    },
];

// modified applicant data used for computing the diff with initial objects
export const modifiedApplicantData = [
    // applicant who modified student_number
    {
        first_name: "John",
        last_name: "Doe",
        utorid: "johnd",
        email: "goofy-duck@donald.com",
        student_number: "10000000",
        phone: null,
    },
    // duplicate applicant
    {
        first_name: "Harry",
        last_name: "Potter",
        utorid: "potterh",
        email: "harry@potter.com",
        student_number: "999666999",
        phone: "41888888888",
    },
    // new applicant
    {
        email: null,
        first_name: "Ron",
        last_name: "Weasley",
        phone: null,
        student_number: null,
        utorid: "weasleyr",
    },
];

// modified position data used for computing the diff with initial objects
export const modifiedPositionData = [
    // position which modified dates, instructors and hours_per_assignment
    {
        contract_template: "Regular",
        duties: "",
        end_date: "2020-05-01T00:00:00.000Z",
        hours_per_assignment: 90,
        instructors: "",
        position_code: "CSC494",
        position_title: "Capstone Project",
        qualifications: "",
        start_date: "2020-01-01T00:00:00.000Z",
    },
    // duplicate position
    {
        contract_template: "Regular",
        duties: "",
        end_date: "2020-12-31T00:00:00.000Z",
        hours_per_assignment: 70,
        instructors: "Smith, Gordon; Smith, Henry",
        position_code: "MAT136H1F",
        position_title: "代数",
        qualifications: "",
        start_date: "2020-02-10T00:00:00.000Z",
    },
    // new position
    {
        contract_template: "Regular",
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
    // position with invalid instructor
    {
        contract_template: "Regular",
        duties: "Tutorials",
        end_date: "2020-12-31T00:00:00.000Z",
        hours_per_assignment: 75,
        instructors: "Invalid, Instructor",
        position_code: "CSC135H1F",
        position_title: "Computer Fun",
        qualifications: "",
        start_date: "2020-02-10T00:00:00.000Z",
    },
];

// modified assignment data used for computing the diff with initial objects
export const modifiedAssignmentData = [
    // assignment which modified wage_chunks
    {
        contract_override_pdf: null,
        active_offer_status: null,
        active_offer_recent_activity_date: null,
        contract_template: "regular",
        end_date: "2021-12-10T00:00:00.000Z",
        hours: 80,
        position_code: "CSC494",
        start_date: "2020-12-10T00:00:00.000Z",
        utorid: "potterh",
        wage_chunks: [
            {
                end_date: "2020-12-31T00:00:00.000Z",
                hours: 20,
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
    // duplicate assignment
    {
        contract_override_pdf: null,
        active_offer_status: null,
        active_offer_recent_activity_date: null,
        contract_template: "regular",
        end_date: "2021-12-10T00:00:00.000Z",
        hours: 80,
        position_code: "CSC494",
        start_date: "2020-12-10T00:00:00.000Z",
        utorid: "johnd",
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
    // new assignment
    {
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
    },
];

export const modifiedAssignmentDataInvalidApplicant = [
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

export const modifiedAssignmentDataInvalidPosition = [
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

// modified ddah data used for computing the diff with initial objects
export const modifiedDdahData = [
    // ddah which modified duties
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
        position_code: "CSC494",
    },
    // duplicate ddah
    {
        applicant: "potterh",
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
    },
    // new ddah
    {
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
    },
];

export const modifiedDdahDataInvalidAssignment = [
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
