export const instructorData = [
    // standard
    {
        first_name: "Gordon",
        last_name: "Smith",
        email: "a@a.com",
        utorid: "smithg",
    },
    // additional id
    {
        id: 2,
        first_name: "Anna",
        last_name: "Smith",
        email: "a@b.com",
        utorid: "smitha",
    },
    // no email
    {
        first_name: "Bob",
        last_name: "Smith",
        utorid: "smithb",
    },
    // strange chars
    {
        first_name: "史密斯",
        last_name: "Smith",
        email: "a@c.com",
        utorid: "smith史密斯",
    },
];

export const applicantData = [
    // standard
    {
        first_name: "Gordon",
        last_name: "Smith",
        email: "a@a.com",
        utorid: "smithg",
        phone: "41666666666",
        student_number: "1000000000",
    },
    // additional id
    {
        id: 2,
        first_name: "Anna",
        last_name: "Smith",
        email: "a@b.com",
        utorid: "smitha",
        phone: "41666666666",
        student_number: "1000000000",
    },
    // no email, phone, student_number
    {
        first_name: "Bob",
        last_name: "Smith",
        utorid: "smithb",
    },
    // strange chars
    {
        first_name: "史密斯",
        last_name: "Smith",
        email: "a@c.com",
        utorid: "smith史密斯",
        phone: "41666666666",
        student_number: "1000000000",
    },
];

export const positionData = [
    // standard
    {
        position_code: "CSC148",
        position_title: "Intro to Comp Sci",
        hours_per_assignment: 10,
        start_date: "2020-02-10T00:00:00.000Z",
        end_date: "2020-12-31T00:00:00.000Z",
        duties: "mark assignments",
        qualifications: "99% in CSC148",
        desired_num_assignments: 20,
        current_enrollment: 400,
        current_waitlisted: 100,
        instructors: [],
        contract_template: {
            template_name: "Regular",
        },
    },
    // additional id
    {
        id: 2,
        position_code: "CSC165",
        position_title: "Intro to Data Struct",
        hours_per_assignment: 10,
        start_date: "2020-02-10T00:00:00.000Z",
        end_date: "2020-12-31T00:00:00.000Z",
        duties: "mark assignments",
        qualifications: "99% in CSC165",
        desired_num_assignments: 20,
        current_enrollment: 400,
        current_waitlisted: 100,
        instructors: [],
        contract_template: {
            template_name: "Regular",
        },
    },
    // only position_code, start_date, end_date, instructors, contract_template, hours_per_assignment
    {
        position_code: "CSC108",
        hours_per_assignment: 0,
        start_date: "2020-02-10T00:00:00.000Z",
        end_date: "2020-12-31T00:00:00.000Z",
        instructors: [],
        contract_template: {
            template_name: "Regular",
        },
    },
    // strange chars
    {
        position_code: "CSC207",
        position_title: "Java入门",
        hours_per_assignment: 10,
        start_date: "2020-02-10T00:00:00.000Z",
        end_date: "2020-12-31T00:00:00.000Z",
        duties: "作业评分",
        qualifications: "99分 in CSC207",
        desired_num_assignments: 20,
        current_enrollment: 400,
        current_waitlisted: 100,
        instructors: [],
        contract_template: {
            template_name: "Regular",
        },
    },
];

export const assignmentData = [
    // no contract_override_pdf || same start/end date with position || no wage_chunk
    {
        applicant: {
            first_name: "Gordon",
            last_name: "Smith",
            email: "a@a.com",
            utorid: "smithg",
            phone: "41666666666",
            student_number: "1000000000",
        },
        position: {
            position_code: "CSC148",
            position_title: "Intro to Comp Sci",
            hours_per_assignment: 10,
            start_date: "2020-02-10T00:00:00.000Z",
            end_date: "2020-12-31T00:00:00.000Z",
            duties: "mark assignments",
            qualifications: "99% in CSC148",
            desired_num_assignments: 20,
            current_enrollment: 400,
            current_waitlisted: 100,
            instructors: [],
            contract_template: {
                template_name: "Regular",
            },
        },
        start_date: "2020-02-10T00:00:00.000Z",
        end_date: "2020-12-31T00:00:00.000Z",
        contract_override_pdf: null,
        hours: 80,
        active_offer_status: null,
        active_offer_recent_activity_date: null,
        wage_chunks: [],
    },
    // has contract_override_pdf || same start/end date with position || no wage_chunk
    {
        applicant: {
            first_name: "Gordon",
            last_name: "Smith",
            email: "a@a.com",
            utorid: "smithg1",
            phone: "41666666666",
            student_number: "1000000000",
        },
        position: {
            position_code: "CSC148",
            position_title: "Intro to Comp Sci",
            hours_per_assignment: 10,
            start_date: "2020-02-10T00:00:00.000Z",
            end_date: "2020-12-31T00:00:00.000Z",
            duties: "mark assignments",
            qualifications: "99% in CSC148",
            desired_num_assignments: 20,
            current_enrollment: 400,
            current_waitlisted: 100,
            instructors: [],
            contract_template: {
                template_name: "Regular",
            },
        },
        start_date: "2020-02-10T00:00:00.000Z",
        end_date: "2020-12-31T00:00:00.000Z",
        contract_override_pdf: "Special",
        hours: 80,
        active_offer_status: null,
        active_offer_recent_activity_date: null,
        wage_chunks: [],
    },
    // no contract_override_pdf || different start/end date with position || no wage_chunk
    {
        applicant: {
            first_name: "Gordon",
            last_name: "Smith",
            email: "a@a.com",
            utorid: "smithg2",
            phone: "41666666666",
            student_number: "1000000000",
        },
        position: {
            position_code: "CSC148",
            position_title: "Intro to Comp Sci",
            hours_per_assignment: 10,
            start_date: "2020-02-10T00:00:00.000Z",
            end_date: "2020-12-31T00:00:00.000Z",
            duties: "mark assignments",
            qualifications: "99% in CSC148",
            desired_num_assignments: 20,
            current_enrollment: 400,
            current_waitlisted: 100,
            instructors: [],
            contract_template: {
                template_name: "Regular",
            },
        },
        start_date: "2020-02-10T00:00:00.000Z",
        end_date: "2020-12-10T00:00:00.000Z", // different end_date with position
        contract_override_pdf: null,
        hours: 80,
        active_offer_status: null,
        active_offer_recent_activity_date: null,
        wage_chunks: [],
    },
    // no contract_override_pdf || same start/end date with position || derivable single wage_chunk
    {
        applicant: {
            first_name: "Gordon",
            last_name: "Smith",
            email: "a@a.com",
            utorid: "smithg3",
            phone: "41666666666",
            student_number: "1000000000",
        },
        position: {
            position_code: "CSC148",
            position_title: "Intro to Comp Sci",
            hours_per_assignment: 10,
            start_date: "2020-02-10T00:00:00.000Z",
            end_date: "2020-12-31T00:00:00.000Z",
            duties: "mark assignments",
            qualifications: "99% in CSC148",
            desired_num_assignments: 20,
            current_enrollment: 400,
            current_waitlisted: 100,
            instructors: [],
            contract_template: {
                template_name: "Regular",
            },
        },
        start_date: "2020-02-10T00:00:00.000Z",
        end_date: "2020-12-31T00:00:00.000Z",
        contract_override_pdf: null,
        hours: 80,
        active_offer_status: null,
        active_offer_recent_activity_date: null,
        wage_chunks: [
            {
                hours: 80,
                rate: 50, // assume session rate is also 50
                start_date: "2020-02-10T00:00:00.000Z",
                end_date: "2020-12-31T00:00:00.000Z",
            },
        ],
    },
    // no contract_override_pdf || same start/end date with position || not derivable single wage_chunk
    {
        applicant: {
            first_name: "Gordon",
            last_name: "Smith",
            email: "a@a.com",
            utorid: "smithg4",
            phone: "41666666666",
            student_number: "1000000000",
        },
        position: {
            position_code: "CSC148",
            position_title: "Intro to Comp Sci",
            hours_per_assignment: 10,
            start_date: "2020-02-10T00:00:00.000Z",
            end_date: "2020-12-31T00:00:00.000Z",
            duties: "mark assignments",
            qualifications: "99% in CSC148",
            desired_num_assignments: 20,
            current_enrollment: 400,
            current_waitlisted: 100,
            instructors: [],
            contract_template: {
                template_name: "Regular",
            },
        },
        start_date: "2020-02-10T00:00:00.000Z",
        end_date: "2020-12-31T00:00:00.000Z",
        contract_override_pdf: null,
        hours: 80,
        active_offer_status: null,
        active_offer_recent_activity_date: null,
        wage_chunks: [
            {
                hours: 80,
                rate: 50,
                start_date: "2020-02-10T00:00:00.000Z",
                end_date: "2020-12-10T00:00:00.000Z", // different end_date with position
            },
        ],
    },
    // no contract_override_pdf || same start/end date with position || not derivable >= 2 wage_chunks
    {
        applicant: {
            first_name: "Gordon",
            last_name: "Smith",
            email: "a@a.com",
            utorid: "smithg5",
            phone: "41666666666",
            student_number: "1000000000",
        },
        position: {
            position_code: "CSC148",
            position_title: "Intro to Comp Sci",
            hours_per_assignment: 10,
            start_date: "2020-12-10T00:00:00.000Z",
            end_date: "2021-12-10T00:00:00.000Z",
            duties: "mark assignments",
            qualifications: "99% in CSC148",
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
    // no contract_override_pdf || same start/end date with position || not derivable 2 wage_chunks
    {
        applicant: {
            first_name: "Gordon",
            last_name: "Smith",
            email: "a@a.com",
            utorid: "smithg6",
            phone: "41666666666",
            student_number: "1000000000",
        },
        position: {
            position_code: "CSC148",
            position_title: "Intro to Comp Sci",
            hours_per_assignment: 10,
            start_date: "2020-12-10T00:00:00.000Z",
            end_date: "2021-12-10T00:00:00.000Z",
            duties: "mark assignments",
            qualifications: "99% in CSC148",
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
                hours: 50,
                rate: 50,
                start_date: "2021-01-01T00:00:00.000Z",
                end_date: "2021-12-01T00:00:00.000Z", // different end_date with position
            },
        ],
    },
    // no contract_override_pdf || same start/end date with position || derivable 2 wage_chunks
    {
        applicant: {
            first_name: "Gordon",
            last_name: "Smith",
            email: "a@a.com",
            utorid: "smithg7",
            phone: "41666666666",
            student_number: "1000000000",
        },
        position: {
            position_code: "CSC148",
            position_title: "Intro to Comp Sci",
            hours_per_assignment: 10,
            start_date: "2020-12-10T00:00:00.000Z",
            end_date: "2021-12-10T00:00:00.000Z",
            duties: "mark assignments",
            qualifications: "99% in CSC148",
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
                hours: 50,
                rate: 50,
                start_date: "2021-01-01T00:00:00.000Z",
                end_date: "2021-12-10T00:00:00.000Z",
            },
        ],
    },
];

export const ddahData = [
    {
        assignment: {
            applicant: {
                first_name: "Gordon",
                last_name: "Smith",
                email: "a@a.com",
                utorid: "smithg8",
                phone: "41666666666",
                student_number: "1000000000",
            },
            position: {
                position_code: "CSC148",
                position_title: "Intro to Comp Sci",
                hours_per_assignment: 10,
                start_date: "2020-02-10T00:00:00.000Z",
                end_date: "2020-12-31T00:00:00.000Z",
                duties: "mark assignments",
                qualifications: "99% in CSC148",
                desired_num_assignments: 20,
                current_enrollment: 400,
                current_waitlisted: 100,
                instructors: [],
                contract_template: {
                    template_name: "Regular",
                },
            },
            start_date: "2020-02-10T00:00:00.000Z",
            end_date: "2020-12-31T00:00:00.000Z",
            contract_override_pdf: null,
            hours: 80,
            active_offer_status: null,
            active_offer_recent_activity_date: null,
            wage_chunks: [
                {
                    hours: 80,
                    rate: 50, // assume session rate is also 50
                    start_date: "2020-02-10T00:00:00.000Z",
                    end_date: "2020-12-31T00:00:00.000Z",
                },
            ],
        },
        duties: [
            {
                order: 1,
                hours: 40,
                description: "creating assignments",
            },
            {
                order: 2,
                hours: 40,
                description: "marking assignments",
            },
        ],
    },
];
