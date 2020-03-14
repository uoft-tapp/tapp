/**
 * @jest-environment node
 */
import { expect } from "./utils";

class DatabaseSeeder {
    constructor() {
        this.seededData = {
            session: {
                start_date: new Date("2020-02-10").toISOString(),
                end_date: new Date("2020-12-31").toISOString(),
                name: "Initial Session",
                rate1: 50
            },
            contractTemplate: {
                template_name: "Regular",
                template_file: "/path/to/regular/template.html"
            },
            position: {
                position_code: "CSC494",
                position_title: "Capstone Project",
                hours_per_assignment: 20,
                start_date: new Date("2020-01-01").toISOString(),
                end_date: new Date("2020-05-01").toISOString(),
                contract_template_id: null
            },
            applicant: {
                utorid: "johnd",
                student_number: "10000000",
                first_name: "John",
                last_name: "Doe",
                email: "fake@email.com",
                phone: "4166666666"
            },
            assignment: {
                position_id: null,
                applicant_id: null,
                hours: 70,
                start_date: new Date("2020-01-01").toISOString(),
                end_date: new Date("2020-05-01").toISOString()
            }
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
        assignment: null
    }
) {
    const { apiPOST } = api;

    await apiPOST("/debug/clear_data");

    //
    // Seed the database with initial data. We assume that everything
    // here will work without failing, so we won't work hard to verify the
    // results.
    //

    let resp = null;

    // Session
    resp = await apiPOST("/admin/sessions", seeded.session);
    // Save the data that was returned to us. What's most important
    // is the session id. Use Object.assign so that all memory
    // references to the original seeded.session are kept intact.
    Object.assign(seeded.session, resp.payload);

    // Contract Template
    resp = await apiPOST(
        `/admin/sessions/${seeded.session.id}/contract_templates`,
        seeded.contractTemplate
    );
    Object.assign(seeded.contractTemplate, resp.payload);

    // Applicant
    resp = await apiPOST(`/admin/applicants`, seeded.applicant);
    Object.assign(seeded.applicant, resp.payload);

    // Position
    Object.assign(seeded.position, {
        contract_template_id: seeded.contractTemplate.id
    });
    resp = await apiPOST(
        `/admin/sessions/${seeded.session.id}/positions`,
        seeded.position
    );
    Object.assign(seeded.position, resp.payload);

    // Assignment
    Object.assign(seeded.assignment, {
        position_id: seeded.position.id,
        applicant_id: seeded.applicant.id
    });
    resp = await apiPOST(`/admin/assignments`, seeded.assignment);
    Object.assign(seeded.assignment, resp.payload);

    //
    // Take a snapshot of the newly seeded data so we can "restore" it
    // before each test.
    //
    await apiPOST("/debug/snapshot");
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
        assignment: null
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
