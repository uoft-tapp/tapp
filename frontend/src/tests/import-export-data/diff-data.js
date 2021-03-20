import { prepareMinimal } from "../../libs/import-export/prepare-json";

/*
 * A collection of initial objects and modified objects
 * used for testing diff functionalities
 */

// a collection of initial instructors, applicants, positions, assignments, ddahs
// used for computing the diff with modified objects
export const reduxStoreData = {
    instructors: [
        {
            id: 418,
            first_name: "Henry",
            last_name: "Smith",
            email: "hery.smith@utoronto.ca",
            utorid: "smithh",
        },
        {
            id: 419,
            first_name: "Emily",
            last_name: "Garcia",
            email: "emily.garcia@utoronto.ca",
            utorid: "garciae",
        },
    ],
    applicants: [
        {
            id: 1761,
            first_name: "John",
            last_name: "Doe",
            email: "goofy-duck@donald.com",
            phone: "4166666666",
            utorid: "johnd",
            student_number: "10000000",
        },
        {
            id: 1763,
            first_name: "Harry",
            last_name: "Potter",
            email: "harry@potter.com",
            phone: null,
            utorid: "potterh",
            student_number: "999666999",
        },
        {
            id: 1765,
            first_name: "Hanna",
            last_name: "Wilson",
            email: "wilsonh@mail.utoronto.ca",
            phone: null,
            utorid: "wilsonh",
            student_number: "600366904",
        },
    ],
    positions: [
        {
            id: 1387,
            position_code: "CSC494",
            position_title: "Capstone Project",
            start_date: "2020-01-01T00:00:00.000Z",
            end_date: "2020-05-01T00:00:00.000Z",
            hours_per_assignment: 20,
            qualifications: null,
            duties: null,
            ad_hours_per_assignment: null,
            ad_num_assignments: null,
            ad_open_date: null,
            ad_close_date: null,
            desired_num_assignments: null,
            current_enrollment: null,
            current_waitlisted: null,
            instructors: [],
            contract_template: {
                id: 889,
                template_file: "default-template.html",
                template_name: "Regular",
            },
            instructor_preferences: [],
        },
        {
            id: 1388,
            position_code: "MAT136H1F",
            position_title: "Calculus II",
            start_date: "2020-02-10T00:00:00.000Z",
            end_date: "2020-12-31T00:00:00.000Z",
            hours_per_assignment: 70,
            qualifications: null,
            duties: null,
            ad_hours_per_assignment: null,
            ad_num_assignments: null,
            ad_open_date: null,
            ad_close_date: null,
            desired_num_assignments: null,
            current_enrollment: null,
            current_waitlisted: null,
            instructors: [
                {
                    id: 419,
                    first_name: "Emily",
                    last_name: "Garcia",
                    email: "emily.garcia@utoronto.ca",
                    utorid: "garciae",
                },
                {
                    id: 418,
                    first_name: "Henry",
                    last_name: "Smith",
                    email: "hery.smith@utoronto.ca",
                    utorid: "smithh",
                },
            ],
            contract_template: {
                id: 889,
                template_file: "default-template.html",
                template_name: "Regular",
            },
            instructor_preferences: [],
        },
    ],
    contractTemplates: [
        {
            id: 889,
            template_file: "default-template.html",
            template_name: "Regular",
        },
    ],
    assignments: [
        {
            id: 1636,
            start_date: "2020-01-01T00:00:00.000Z",
            end_date: "2020-05-01T00:00:00.000Z",
            note: null,
            contract_override_pdf: null,
            active_offer_status: null,
            active_offer_url_token: null,
            active_offer_recent_activity_date: null,
            active_offer_nag_count: null,
            hours: 70,
            position: {
                id: 1387,
                position_code: "CSC494",
                position_title: "Capstone Project",
                start_date: "2020-01-01T00:00:00.000Z",
                end_date: "2020-05-01T00:00:00.000Z",
                hours_per_assignment: 20,
                qualifications: null,
                duties: null,
                ad_hours_per_assignment: null,
                ad_num_assignments: null,
                ad_open_date: null,
                ad_close_date: null,
                desired_num_assignments: null,
                current_enrollment: null,
                current_waitlisted: null,
                instructors: [],
                contract_template: {
                    id: 889,
                    template_file: "default-template.html",
                    template_name: "Regular",
                },
                instructor_preferences: [],
            },
            applicant: {
                id: 1761,
                first_name: "John",
                last_name: "Doe",
                email: "goofy-duck@donald.com",
                phone: "4166666666",
                utorid: "johnd",
                student_number: "10000000",
            },
            wage_chunks: [
                {
                    id: 1972,
                    assignment_id: 1636,
                    start_date: "2020-01-01T00:00:00.000Z",
                    end_date: "2020-05-01T00:00:00.000Z",
                    hours: 70,
                    rate: 50,
                },
            ],
        },
        {
            id: 1637,
            start_date: "2020-02-10T00:00:00.000Z",
            end_date: "2020-12-31T00:00:00.000Z",
            note: null,
            contract_override_pdf: null,
            active_offer_status: null,
            active_offer_url_token: null,
            active_offer_recent_activity_date: null,
            active_offer_nag_count: null,
            hours: 70,
            position: {
                id: 1388,
                position_code: "MAT136H1F",
                position_title: "Calculus II",
                start_date: "2020-02-10T00:00:00.000Z",
                end_date: "2020-12-31T00:00:00.000Z",
                hours_per_assignment: 70,
                qualifications: null,
                duties: null,
                ad_hours_per_assignment: null,
                ad_num_assignments: null,
                ad_open_date: null,
                ad_close_date: null,
                desired_num_assignments: null,
                current_enrollment: null,
                current_waitlisted: null,
                instructors: [
                    {
                        id: 419,
                        first_name: "Emily",
                        last_name: "Garcia",
                        email: "emily.garcia@utoronto.ca",
                        utorid: "garciae",
                    },
                    {
                        id: 418,
                        first_name: "Henry",
                        last_name: "Smith",
                        email: "hery.smith@utoronto.ca",
                        utorid: "smithh",
                    },
                ],
                contract_template: {
                    id: 889,
                    template_file: "default-template.html",
                    template_name: "Regular",
                },
                instructor_preferences: [],
            },
            applicant: {
                id: 1763,
                first_name: "Harry",
                last_name: "Potter",
                email: "harry@potter.com",
                phone: null,
                utorid: "potterh",
                student_number: "999666999",
            },
            wage_chunks: [
                {
                    id: 1973,
                    assignment_id: 1637,
                    start_date: "2020-02-10T00:00:00.000Z",
                    end_date: "2020-12-31T00:00:00.000Z",
                    hours: 70,
                    rate: 50,
                },
            ],
        },
    ],
    session: { rate: 40, rate1: 40, rate2: 40, rate3: 40 },
    ddahs: [
        {
            id: 170,
            approved_date: null,
            accepted_date: null,
            revised_date: null,
            emailed_date: "2021-03-20T03:22:33.827Z",
            signature: null,
            url_token: "y9S3cBqBQQu4YmFkvAnN94xe",
            duties: [
                {
                    order: 1,
                    hours: 4,
                    description: "Initial training",
                },
                {
                    order: 2,
                    hours: 25,
                    description: "Marking the midterm",
                },
                {
                    order: 3,
                    hours: 40,
                    description: "Running tutorials",
                },
            ],
            status: "emailed",
            total_hours: 69,
            assignment: {
                id: 1637,
                start_date: "2020-02-10T00:00:00.000Z",
                end_date: "2020-12-31T00:00:00.000Z",
                note: null,
                contract_override_pdf: null,
                active_offer_status: null,
                active_offer_url_token: null,
                active_offer_recent_activity_date: null,
                active_offer_nag_count: null,
                hours: 70,
                position: {
                    id: 1388,
                    position_code: "MAT136H1F",
                    position_title: "Calculus II",
                    start_date: "2020-02-10T00:00:00.000Z",
                    end_date: "2020-12-31T00:00:00.000Z",
                    hours_per_assignment: 70,
                    qualifications: null,
                    duties: null,
                    ad_hours_per_assignment: null,
                    ad_num_assignments: null,
                    ad_open_date: null,
                    ad_close_date: null,
                    desired_num_assignments: null,
                    current_enrollment: null,
                    current_waitlisted: null,
                    instructors: [
                        {
                            id: 419,
                            first_name: "Emily",
                            last_name: "Garcia",
                            email: "emily.garcia@utoronto.ca",
                            utorid: "garciae",
                        },
                        {
                            id: 418,
                            first_name: "Henry",
                            last_name: "Smith",
                            email: "hery.smith@utoronto.ca",
                            utorid: "smithh",
                        },
                    ],
                    contract_template: {
                        id: 889,
                        template_file: "default-template.html",
                        template_name: "Regular",
                    },
                    instructor_preferences: [],
                },
                applicant: {
                    id: 1763,
                    first_name: "Harry",
                    last_name: "Potter",
                    email: "harry@potter.com",
                    phone: null,
                    utorid: "potterh",
                    student_number: "999666999",
                },
                wage_chunks: [
                    {
                        id: 1973,
                        assignment_id: 1637,
                        start_date: "2020-02-10T00:00:00.000Z",
                        end_date: "2020-12-31T00:00:00.000Z",
                        hours: 70,
                        rate: 50,
                    },
                ],
            },
        },
    ],
};

// modified instructor data used for computing the diff with initial objects
export const modifiedInstructorData = reduxStoreData.instructors.map(
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

// modified applicant data used for computing the diff with initial objects
export const modifiedApplicantData = reduxStoreData.applicants.map(
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

// modified position data used for computing the diff with initial objects
export const modifiedPositionData = reduxStoreData.positions.map(
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

export const modifiedPositionDataInvalidInstructor = [
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

// modified assignment data used for computing the diff with initial objects
export const modifiedAssignmentData = reduxStoreData.assignments.map(
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
export const modifiedDdahData = reduxStoreData.ddahs.map(prepareMinimal.ddah);
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
