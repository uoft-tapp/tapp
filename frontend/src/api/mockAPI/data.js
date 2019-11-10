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
    available_contract_templates: [
        { template_file: "/math/default.html" },
        { template_file: "/math/default2018.html" },
        { template_file: "/math/invigilate.html" },
        { template_file: "/math/invigilate2014.html" },
        { template_file: "/math/oto.html" }
    ],
    contract_templates: [
        {
            id: 1,
            template_name: "standard",
            template_file: "/math/default.html"
        },
        { id: 2, template_name: "oto", template_file: "/math/oto.html" },
        {
            id: 3,
            template_name: "standard",
            template_file: "/math/default2018.html"
        },
        {
            id: 4,
            template_name: "invigilate",
            template_file: "/math/invigilate.html"
        }
    ],
    contract_templates_by_session: {
        1: [1, 2],
        2: [3, 4]
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
            hours_per_assignment: 70,
            start_date: "2019-09-08T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            contract_template_id: 1,
            duties: "Tutorials",
            qualifications: "Teaching skill",
            ad_hours_per_assignment: 70,
            ad_num_assignments: 15,
            ad_open_date: "2019-08-01T00:00:00.000Z",
            ad_close_date: "2019-08-15T00:00:00.000Z",
            desired_num_assignments: 15,
            current_enrollment: 1200,
            current_waitlisted: 200,
            instructor_ids: [1000, 1001]
        },
        {
            id: 11,
            position_code: "MAT136H1F",
            position_title: "Calculus II",
            hours_per_assignment: 70,
            start_date: "2019-09-08T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            contract_template_id: 2,
            instructor_ids: []
        },
        {
            id: 12,
            position_code: "CSC135H1F",
            position_title: "Computer Fun",
            hours_per_assignment: 70,
            start_date: "2019-09-08T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            duties: "Tutorials",
            contract_template_id: 3,
            instructor_ids: [1000]
        },
        {
            id: 13,
            position_code: "MAT235H1F",
            position_title: "Calculus III",
            hours_per_assignment: 70,
            start_date: "2019-09-08T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            contract_template_id: 3,
            instructor_ids: [1002]
        }
    ],
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
    assignments_by_session: { 1: [100, 101], 2: [] },
    assignments: [
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
    applications: [
        {
            comments: "",
            program: "Phd",
            department: "Computer Science",
            previous_uoft_ta_experience: "Last year I TAed a bunch",
            yip: 2,
            annotation: "",
            session_id: 1,
            applicant_id: 2000
        },
        {
            comments: "",
            program: "UG",
            department: "Computer Science",
            previous_uoft_ta_experience: "",
            yip: 2,
            annotation: "",
            session_id: 1,
            applicant_id: 2001
        },
        {
            comments: "",
            program: "Phd",
            department: "Math",
            previous_uoft_ta_experience: "",
            yip: 2,
            annotation: "",
            session_id: 1,
            applicant_id: 2002
        },
        {
            comments: "",
            program: "Phd",
            department: "Computer Science",
            previous_uoft_ta_experience: "",
            yip: 2,
            annotation: "",
            session_id: 1,
            applicant_id: 2005
        },
        {
            comments: "",
            program: "UG",
            department: "Computer Science",
            previous_uoft_ta_experience: "",
            yip: 2,
            annotation: "",
            session_id: 1,
            applicant_id: 2006
        },
        {
            comments: "",
            program: "UG",
            department: "Math",
            previous_uoft_ta_experience: "",
            yip: 3,
            annotation: "",
            session_id: 2,
            applicant_id: 2002
        },
        {
            comments: "",
            program: "MSc",
            department: "Computer Science",
            previous_uoft_ta_experience: "",
            yip: 2,
            annotation: "",
            session_id: 2,
            applicant_id: 2003
        },
        {
            comments: "",
            program: "UG",
            department: "Computer Science",
            previous_uoft_ta_experience: "",
            yip: 4,
            annotation: "",
            session_id: 2,
            applicant_id: 2004
        }
    ]
};
