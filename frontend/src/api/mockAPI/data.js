export const mockData = {
    sessions: [
        {
            id: 1,
            start_date: "2019-09-08T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            name: "2019 Fall",
            rate1: 45.55,
            rate2: 47.33
        },
        {
            id: 2,
            start_date: "2020-01-01T00:00:00.000Z",
            end_date: "2020-04-30T00:00:00.000Z",
            name: "2021 Spring",
            rate1: 45.55,
            rate2: null
        }
    ],
    available_position_templates: [
        { offer_template: "/math/default.html" },
        { offer_template: "/math/default2018.html" },
        { offer_template: "/math/invigilate.html" },
        { offer_template: "/math/invigilate2014.html" },
        { offer_template: "/math/oto.html" }
    ],
    position_templates_by_session: {
        1: [
            {
                id: 1,
                position_type: "standard",
                offer_template: "/math/default.html"
            },
            { id: 2, position_type: "oto", offer_template: "/math/oto.html" }
        ],
        2: [
            {
                id: 3,
                position_type: "standard",
                offer_template: "/math/default2018.html"
            },
            {
                id: 4,
                position_type: "invigilate",
                offer_template: "/math/invigilate.html"
            }
        ]
    },
    instructors: [
        {
            id: 1000,
            last_name: "Smith",
            first_name: "Henry",
            email: "hery.smith@utoronto.ca",
            utorid: "smithh"
        },
        {
            id: 1001,
            last_name: "Garcia",
            first_name: "Emily",
            email: "emily.garcia@utoronto.ca",
            utorid: "garciae"
        },
        {
            id: 1002,
            last_name: "Miller",
            first_name: "Megan",
            email: "megan.miller@utoronto.ca",
            utorid: "millerm"
        },
        {
            id: 1003,
            last_name: "Beera",
            first_name: "Lizzy",
            email: "lizzy.beera@utoronto.ca",
            utorid: "beeral"
        }
    ],
    positions_by_session: {
        1: [10, 11],
        2: [12, 13]
    },
    positions: [
        {
            id: 10,
            position_code: "MAT135H1F",
            position_title: "Calculus I",
            est_hours_per_assignment: 70,
            est_start_date: "2019-09-08T00:00:00.000Z",
            est_end_date: "2019-12-31T00:00:00.000Z",
            position_type: "standard",
            duties: "Tutorials",
            qualifications: "Teaching skill",
            ad_hours_per_assignment: 70,
            ad_num_assignments: 15,
            ad_open_date: "2019-08-01T00:00:00.000Z",
            ad_close_date: "2019-08-15T00:00:00.000Z",
            desired_num_assignments: 15,
            current_enrollment: 1200,
            current_waitlisted: 200,
            instructors: ["smithh", "garciae"]
        },
        {
            id: 11,
            position_code: "MAT136H1F",
            position_title: "Calculus II",
            est_hours_per_assignment: 70,
            est_start_date: "2019-09-08T00:00:00.000Z",
            est_end_date: "2019-12-31T00:00:00.000Z",
            position_type: "invigilation",
            instructors: []
        },
        {
            id: 12,
            position_code: "CSC135H1F",
            position_title: "Computer Fun",
            est_hours_per_assignment: 70,
            est_start_date: "2019-09-08T00:00:00.000Z",
            est_end_date: "2019-12-31T00:00:00.000Z",
            position_type: "standard",
            duties: "Tutorials",
            instructors: ["smithh"]
        },
        {
            id: 13,
            position_code: "MAT235H1F",
            position_title: "Calculus III",
            est_hours_per_assignment: 70,
            est_start_date: "2019-09-08T00:00:00.000Z",
            est_end_date: "2019-12-31T00:00:00.000Z",
            position_type: "invigilation",
            instructors: ["millerm"]
        }
    ],
    applications_by_session: {
        1: [1, 2, 3, 4, 5],
        2: [1, 2, 3, 4, 5, 6]
    },
    applications: [
        {
            id: 1,
            status: "selected",
            comments: "This is a comment",
            program: "Computer Science",
            department: "Arts and Science",
            previous_uoft_ta_experience: "CSC148",
            applicant_id: 2000,
            position_id: 10
        },
        {
            id: 2,
            status: "available",
            comments: "This is a comment",
            program: "Life Science",
            department: "Arts and Science",
            previous_uoft_ta_experience: "BIO120",
            applicant_id: 2001,
            position_id: 10
        },
        {
            id: 3,
            status: "available",
            comments: "This is a comment",
            program: "Computer Science",
            department: "Arts and Science",
            previous_uoft_ta_experience: "CSC165",
            applicant_id: 2002,
            position_id: 10
        },
        {
            id: 4,
            status: "selected",
            comments: "This is a comment",
            program: "Computer Science",
            department: "Arts and Science",
            previous_uoft_ta_experience: "CSC165",
            applicant_id: 2003,
            position_id: 10
        },
        {
            id: 5,
            status: "selected",
            comments: "This is a comment",
            program: "Computer Science",
            department: "Arts and Science",
            previous_uoft_ta_experience: "CSC165",
            applicant_id: 2004,
            position_id: 10
        },
        {
            id: 6,
            status: "selected",
            comments: "This is a comment",
            program: "Computer Science",
            department: "Arts and Science",
            previous_uoft_ta_experience: "CSC165",
            applicant_id: 2006,
            position_id: 10
        },
    ],
    applicants_by_session: {
        1: ["weasleyr", "potterh", "smithb", "molinat", "howeyb", "brownd"],
        2: ["smithb", "wilsonh", "molinat"]
    },
    applicants: [
        {
            id: 2000,
            utorid: "weasleyr",
            student_number: "89013443",
            first_name: "Ron",
            last_name: "Weasley",
            email: "ron@potter.com",
            phone: "543-223-9993"
        },
        {
            id: 2001,
            utorid: "potterh",
            student_number: "999666999",
            first_name: "Harry",
            last_name: "Potter",
            email: "harry@potter.com"
        },
        {
            id: 2002,
            utorid: "smithb",
            email: "smithb@mail.utoronto.ca",
            first_name: "Bethany",
            last_name: "Smith",
            student_number: "131382748"
        },
        {
            id: 2003,
            utorid: "wilsonh",
            email: "wilsonh@mail.utoronto.ca",
            first_name: "Hanna",
            last_name: "Wilson",
            student_number: "600366904"
        },
        {
            id: 2004,
            utorid: "molinat",
            email: "molinat@mail.utoronto.ca",
            first_name: "Troy",
            last_name: "Molina",
            student_number: "328333023"
        },
        {
            id: 2005,
            utorid: "howeyb",
            email: "howeyb@mail.utoronto.ca",
            first_name: "Brett",
            last_name: "Howey",
            student_number: "329613524"
        },
        {
            id: 2006,
            utorid: "brownd",
            email: "brownd@mail.utoronto.ca",
            first_name: "David",
            last_name: "Brown",
            student_number: "29151485"
        }
    ],
    assignments: {
        1: [
            {
                id: 100,
                position_id: 10,
                applicant_id: 2001,
                hours: 90
            },
            {
                id: 101,
                position_id: 10,
                applicant_id: 2005,
                hours: 95
            }
        ],
        2: []
    }
};
