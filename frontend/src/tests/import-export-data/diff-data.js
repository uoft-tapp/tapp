/*
 * A collection of initial objects and modified objects
 * used for testing diff functionalities
 */

// instructor data to compare and compute diff
export const initialInstructorData = {
    instructors: [
        {
            first_name: "Henry",
            utorid: "smithh",
            last_name: "Smith",
            email: "OLD@utoronto.ca",
        },
        {
            email: "gordon.smith@utoronto.ca",
            first_name: "戈登",
            utorid: "smithhg",
        },
    ],
};

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

// applicant data to compare and compute diff
export const initialApplicantData = {
    applicants: [
        {
            first_name: "John",
            last_name: "Doe",
            utorid: "johnd",
            email: "goofy-duck@donald.com",
            student_number: "OLD10000000",
        },
        {
            first_name: "哈利",
            last_name: "Potter",
            utorid: "potterh",
            email: "harry@potter.com",
            student_number: "999666999",
            phone: "41888888888",
        },
    ],
};

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

// position data to compare and compute diff
export const initialPositionData = {
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
};

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

// assignment data to compare and compute diff
export const initialAssignmentData = {
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
                first_name: "Ron",
                last_name: "Weasley",
                utorid: "weasleyr",
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
        { first_name: "John", last_name: "Doe", utorid: "doej" },
    ],
    session: { rate: 50, rate1: 50, rate2: 50, rate3: 50 },
};

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

// ddah data to compare and compute diff
export const initialApplicantDataForDdah = [
    {
        first_name: "Hanna",
        last_name: "Wilson",
        email: "wilsonh@mail.utoronto.ca",
        utorid: "wilsonh",
        phone: "41666666666",
        student_number: "1000000000",
    },
];

export const initialDdahData = {
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
};

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
