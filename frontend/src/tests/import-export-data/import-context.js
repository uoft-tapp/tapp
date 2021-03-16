/*
 * A collection of context (existing objects)
 * used for computing difference when importing objects.
 */

export const importInstructorContext = {
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
};

export const importApplicantContext = {
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
};

export const importPositionContext = {
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

export const importPositionContextNoSmithHenry = {
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
};

export const importAssignmentContext = {
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
};

export const importAssignmentContextNoApplicant = {
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
};

export const importAssignmentContextNoPosition = {
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
};

export const importDdahApplicantContext = [
    {
        first_name: "Hanna",
        last_name: "Wilson",
        email: "wilsonh@mail.utoronto.ca",
        utorid: "wilsonh",
        phone: "41666666666",
        student_number: "1000000000",
    },
];

export const importDdahContext = {
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
};

export const importDdahContextNoAssignment = {
    ddahs: [],
    assignments: [],
};
