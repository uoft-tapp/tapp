/**
 * @jest-environment node
 */
import { expect } from "./utils";
import { recursiveDeleteProp } from "../api/mockAPI/utils";

class DatabaseSeeder {
    constructor() {
        this.seededData = {
            session: {
                start_date: new Date("2020-02-10").toISOString(),
                end_date: new Date("2020-12-31").toISOString(),
                name: "Initial Session",
                rate1: 50,
            },
            contractTemplate: {
                template_name: "Regular",
                template_file: "default-template.html",
            },
            position: {
                position_code: "CSC494",
                position_title: "Capstone Project",
                hours_per_assignment: 20,
                start_date: new Date("2020-01-01").toISOString(),
                end_date: new Date("2020-05-01").toISOString(),
                contract_template_id: null,
            },
            applicant: {
                utorid: "johnd",
                student_number: "10000000",
                first_name: "John",
                last_name: "Doe",
                email: "fake@email.com",
                phone: "4166666666",
            },
            assignment: {
                position_id: null,
                applicant_id: null,
                hours: 70,
                start_date: new Date("2020-01-01").toISOString(),
                end_date: new Date("2020-05-01").toISOString(),
            },
            active_user: {
                utorid: "smithh",
                roles: ["admin", "instructor", "ta"],
            },
            // Data that is used for second-tier seeding (that is, non-minimal seeding of the database)
            instructors: [
                // Henry Smith is the active user and has an instructor role, so
                // should definitely be seeded.
                {
                    last_name: "Smith",
                    first_name: "Henry",
                    email: "hery.smith@utoronto.ca",
                    utorid: "smithh",
                },
                {
                    last_name: "Garcia",
                    first_name: "Emily",
                    email: "emily.garcia@utoronto.ca",
                    utorid: "garciae",
                },
                {
                    last_name: "Miller",
                    first_name: "Megan",
                    email: "megan.miller@utoronto.ca",
                    utorid: "millerm",
                },
                {
                    last_name: "Lucas",
                    first_name: "George",
                    email: "george.lucas@utoronto.ca",
                    utorid: "lucasg",
                },
                {
                    last_name: "Bell",
                    first_name: "Jordan",
                    email: "jordan.bell@utoronto.ca",
                    utorid: "belljo",
                },
            ],
            applicants: [
                {
                    utorid: "weasleyr",
                    student_number: "89013443",
                    first_name: "Ron",
                    last_name: "Weasley",
                    email: "ron@potter.com",
                    phone: "543-223-9993",
                },
                {
                    utorid: "potterh",
                    student_number: "999666999",
                    first_name: "Harry",
                    last_name: "Potter",
                    email: "harry@potter.com",
                },
                {
                    utorid: "smithb",
                    email: "smithb@mail.utoronto.ca",
                    first_name: "Bethany",
                    last_name: "Smith",
                    student_number: "131382748",
                },
                {
                    utorid: "wilsonh",
                    email: "wilsonh@mail.utoronto.ca",
                    first_name: "Hanna",
                    last_name: "Wilson",
                    student_number: "600366904",
                },
                {
                    utorid: "molinat",
                    email: "molinat@mail.utoronto.ca",
                    first_name: "Troy",
                    last_name: "Molina",
                    student_number: "328333023",
                },
                {
                    utorid: "howeyb",
                    email: "howeyb@mail.utoronto.ca",
                    first_name: "Brett",
                    last_name: "Howey",
                    student_number: "329613524",
                },
                {
                    utorid: "brownd",
                    email: "brownd@mail.utoronto.ca",
                    first_name: "David",
                    last_name: "Brown",
                    student_number: "29151485",
                },
            ],
            positions: [
                {
                    position_code: "MAT136H1F",
                    position_title: "Calculus II",
                    hours_per_assignment: 70,
                    contract_template_id: null,
                    instructor_ids: [],
                    // This field is only for seed data
                    instructor_utorids: ["smithh", "garciae"],
                },
                {
                    position_code: "CSC135H1F",
                    position_title: "Computer Fun",
                    hours_per_assignment: 75,
                    duties: "Tutorials",
                    contract_template_id: null,
                    instructor_ids: [],
                    instructor_utorids: ["smithh"],
                },
                {
                    id: 13,
                    position_code: "MAT235H1F",
                    position_title: "Calculus III",
                    hours_per_assignment: 140,
                    contract_template_id: null,
                    instructor_ids: [],
                    instructor_utorids: [],
                },
                {
                    position_code: "CSC555Y1",
                    position_title: "Computer Networks",
                    hours_per_assignment: 70,
                    contract_template_id: null,
                    instructor_ids: [],
                    instructor_utorids: ["lucasg", "millerm"],
                },
                {
                    position_code: "ECO101H1F",
                    position_title: "Microeconomics",
                    hours_per_assignment: 50,
                    contract_template_id: null,
                    instructor_ids: [],
                    instructor_utorids: ["millerm", "belljo"],
                },
            ],
            assignments: [
                {
                    position_code: "MAT136H1F",
                    applicant_utorid: "potterh",
                },
                {
                    position_code: "MAT136H1F",
                    applicant_utorid: "howeyb",
                },
                {
                    position_code: "MAT136H1F",
                    applicant_utorid: "brownd",
                },
                {
                    position_code: "CSC135H1F",
                    applicant_utorid: "potterh",
                },
                {
                    position_code: "CSC135H1F",
                    applicant_utorid: "wilsonh",
                },
                {
                    position_code: "MAT235H1F",
                    applicant_utorid: "weasleyr",
                },
                {
                    _ddah_seed_id: 1,
                    position_code: "CSC555Y1",
                    applicant_utorid: "molinat",
                },
                {
                    _ddah_seed_id: 2,
                    position_code: "ECO101H1F",
                    applicant_utorid: "brownd",
                },
            ],
            ddahs: [
                {
                    _assignment_seed_id: 1,
                    duties: [
                        {
                            order: 2,
                            hours: 18,
                            description: "marking:Marking midterms",
                        },
                        {
                            order: 1,
                            hours: 2,
                            description: "training:Initial TA training",
                        },
                        {
                            order: 3,
                            hours: 50,
                            description: "contact:Tutorials",
                        },
                    ],
                },
                {
                    _assignment_seed_id: 2,
                    duties: [
                        {
                            order: 2,
                            hours: 18,
                            description: "marking:Marking midterms",
                        },
                        {
                            order: 1,
                            hours: 2,
                            description: "training:Initial TA training",
                        },
                        {
                            order: 3,
                            hours: 50,
                            description: "contact:Tutorials",
                        },
                    ],
                },
            ],
        };
    }

    /**
     * Seeds the database by clearing it first, then seeding,
     * then taking a snapshot.
     *
     * @param {*} api
     * @memberof DatabaseSeeder
     */
    async seed(api) {
        return await seedDatabase(api, this.seededData);
    }

    /**
     * Seeds the database with enough data to test instructor
     * routes. The database is *not* cleared before this call
     * and it is assume that `this.seed()` has been called prior.
     *
     * @param {*} api
     * @memberof DatabaseSeeder
     */
    async seedForInstructors(api) {
        return await seedDatabaseForInstructors(api, this.seededData);
    }

    /**
     * Verify that the data that was just seeded can be retrieved
     * from the API.
     *
     * @param {*} api
     * @memberof DatabaseSeeder
     */
    async verifySeed(api) {
        return await verifySeededDatabase(api, this.seededData);
    }
}

export const databaseSeeder = new DatabaseSeeder();

/**
 * Seeding the database with the minimal set of API calls to create an assignment.
 */
async function seedDatabase(
    api,
    seeded = {
        session: null,
        contractTemplate: null,
        position: null,
        applicant: null,
        assignment: null,
    }
) {
    const { apiPOST } = api;

    await apiPOST("/debug/clear_data");

    //
    // Seed the database with initial data. We assume that everything
    // here will work without failing, so we won't work hard to verify the
    // results.
    //

    // Before we seed, we want to make sure our `seeded` data doesn't have any lingering
    // `id` fields left over from previous runs.
    recursiveDeleteProp(seeded, "id");

    let resp = null;

    // We must first ensure there is a user with the proper permissions
    // set as the active user. Otherwise, subsequent requests will fail
    resp = await apiPOST("/debug/users", seeded.active_user);
    expect(resp).toHaveStatus("success");
    Object.assign(seeded.active_user, resp.payload);
    await apiPOST("/debug/active_user", seeded.active_user);

    // Session
    resp = await apiPOST("/admin/sessions", seeded.session);
    // Save the data that was returned to us. What's most important
    // is the session id. Use Object.assign so that all memory
    // references to the original seeded.session are kept intact.
    expect(resp).toHaveStatus("success");
    Object.assign(seeded.session, resp.payload);

    // Contract Template
    resp = await apiPOST(
        `/admin/sessions/${seeded.session.id}/contract_templates`,
        seeded.contractTemplate
    );
    expect(resp).toHaveStatus("success");
    Object.assign(seeded.contractTemplate, resp.payload);

    // Applicant
    resp = await apiPOST(`/admin/applicants`, seeded.applicant);
    expect(resp).toHaveStatus("success");
    Object.assign(seeded.applicant, resp.payload);

    // Position
    Object.assign(seeded.position, {
        contract_template_id: seeded.contractTemplate.id,
    });
    resp = await apiPOST(
        `/admin/sessions/${seeded.session.id}/positions`,
        seeded.position
    );
    expect(resp).toHaveStatus("success");
    Object.assign(seeded.position, resp.payload);

    // Assignment
    Object.assign(seeded.assignment, {
        position_id: seeded.position.id,
        applicant_id: seeded.applicant.id,
    });
    resp = await apiPOST(`/admin/assignments`, seeded.assignment);
    expect(resp).toHaveStatus("success");
    Object.assign(seeded.assignment, resp.payload);
}

/**
 * Verify a just seeded database.
 */
async function verifySeededDatabase(
    api,
    seeded = {
        session: null,
        contractTemplate: null,
        position: null,
        applicant: null,
        assignment: null,
    }
) {
    const { apiGET } = api;

    let resp = null;

    resp = await apiGET(`/admin/sessions`);
    expect(resp.payload).toContainObject(seeded.session);

    resp = await apiGET(
        `/admin/sessions/${seeded.session.id}/contract_templates`
    );
    expect(resp.payload).toContainObject(seeded.contractTemplate);

    resp = await apiGET(`/admin/sessions/${seeded.session.id}/applicants`);
    expect(resp.payload).toContainObject(seeded.applicant);

    resp = await apiGET(`/admin/sessions/${seeded.session.id}/positions`);
    expect(resp.payload).toContainObject(seeded.position);

    resp = await apiGET(`/admin/sessions/${seeded.session.id}/assignments`);
    expect(resp.payload).toContainObject(seeded.assignment);
}

/**
 * Seeding the database with enough data that instructor routes can be tested.
 * This function should be called *after* `seedDatabase`. It assumes a valid
 * contract template and session have been passed in.
 */
async function seedDatabaseForInstructors(
    api,
    seeded = {
        active_user: null,
        session: null,
        contractTemplate: null,
        positions: null,
        applicants: null,
        instructors: null,
        assignments: null,
    }
) {
    const { apiPOST } = api;

    //
    // Seed the database with initial data. We assume that everything
    // here will work without failing, so we won't work hard to verify the
    // results.
    //

    let resp = null;

    // Applicant
    for (const applicant of seeded.applicants) {
        resp = await apiPOST(
            `/admin/sessions/${seeded.session.id}/applicants`,
            applicant
        );
        expect(resp).toHaveStatus("success");
        Object.assign(applicant, resp.payload);
    }

    // Instructors
    for (const instructor of seeded.instructors) {
        resp = await apiPOST(`/admin/instructors`, instructor);
        expect(resp).toHaveStatus("success");
        Object.assign(instructor, resp.payload);
    }

    // Position
    for (const position of seeded.positions) {
        Object.assign(position, {
            contract_template_id: seeded.contractTemplate.id,
        });
        // Turn the instructor utorids into ids
        position.instructor_ids = [];
        for (const utorid of position.instructor_utorids || []) {
            const { id } =
                seeded.instructors.find(
                    (instructor) => instructor.utorid === utorid
                ) || {};
            if (id == null) {
                throw new Error(
                    `Inconsistency in seed data: could not find instructor with utorid ${utorid}`
                );
            }
            position.instructor_ids.push(id);
        }
        //delete position.instructor_utorids;
        resp = await apiPOST(
            `/admin/sessions/${seeded.session.id}/positions`,
            position
        );
        expect(resp).toHaveStatus("success");
        Object.assign(position, resp.payload);
    }

    // Assignment
    // We will keep track of the inserted assignments for the purpose
    // of creating DDAHs for some of them later
    const processedAssignments = [];
    for (const assignment of seeded.assignments) {
        // The seed data is written in terms of position codes
        // and applicant utorids, so we need to mangle the data
        // so it's suitable for the API
        const { id: applicant_id } =
            seeded.applicants.find(
                (applicant) => applicant.utorid === assignment.applicant_utorid
            ) || {};
        if (applicant_id == null) {
            throw new Error(
                `Inconsistency in seed data: could not find applicant with utorid ${assignment.applicant_utorid}`
            );
        }
        const { id: position_id } =
            seeded.positions.find(
                (position) =>
                    position.position_code === assignment.position_code
            ) || {};
        if (position_id == null) {
            throw new Error(
                `Inconsistency in seed data: could not find position with position code ${assignment.position_code}`
            );
        }

        Object.assign(assignment, {
            position_id,
            applicant_id,
        });
        resp = await apiPOST(`/admin/assignments`, assignment);
        expect(resp).toHaveStatus("success");
        Object.assign(assignment, resp.payload);
        processedAssignments.push(assignment);
    }

    // DDAH
    for (const ddah of seeded.ddahs) {
        // _assignment_seed_id in ddahs should correspond to _ddah_seed_id in assignments
        if (!ddah._assignment_seed_id) {
            throw new Error(
                `Inconsistency in seed data: could not create ddah without _assignment_seed_id`
            );
        }

        // The seed data is written in terms of position codes
        // and applicant utorids, since unique applicant can apply to
        // at most one position
        const { id: assignment_id } =
            processedAssignments.find(
                (assignment) =>
                    assignment._ddah_seed_id === ddah._assignment_seed_id
            ) || {};
        if (!assignment_id) {
            throw new Error(
                `Inconsistency in seed data: could not find assignment with _ddah_seed_id ${ddah._assignment_seed_id}`
            );
        }

        const newDdah = {
            ...ddah,
            assignment_id,
        };
        let resp = await apiPOST(`/admin/ddahs`, newDdah);
        expect(resp).toHaveStatus("success");
    }
}
