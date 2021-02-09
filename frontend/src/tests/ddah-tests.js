/**
 * @jest-environment node
 */
import { it, expect, beforeAll, addSession } from "./utils";
import { databaseSeeder } from "./setup";
import axios from "axios";

/**
 * Compute the total number of hours from all duties listed in the DDAH
 *
 * @param {Ddah} ddah
 * @returns
 */
function computeTotalHoursForDdah(ddah) {
    let totalHours = 0;
    for (const duty of ddah.duties) {
        totalHours += duty.hours;
    }
    return totalHours;
}

/**
 * Tests for the API. These are encapsulated in a function so that
 * different `apiGET` and `apiPOST` functions can be passed in. For example,
 * they may be functions that make actual requests via http or they may
 * be from the mock API.
 *
 * @param {object} api
 * @param {Function} api.apiGET A function that when passed a route will return the get response
 * @param {Function} api.apiPOST A function that when passed a route and data, will return the post response
 */
export function ddahTests(api) {
    const { apiGET, apiPOST } = api;

    let session = null;
    let assignments = null;
    let appliants = null;
    let ddah = {};

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        await databaseSeeder.seedForInstructors(api);
        session = databaseSeeder.seededData.session;
        assignments = databaseSeeder.seededData.assignments;
        appliants = databaseSeeder.seededData.applicants;
    }, 30000);

    it("create a ddah", async () => {
        const newDdah = {
            assignment_id: assignments[0].id,
            duties: [
                {
                    order: 2,
                    hours: 25,
                    description: "Marking the midterm",
                },
                {
                    order: 1,
                    hours: 4,
                    description: "Initial training",
                },
                {
                    order: 3,
                    hours: 40,
                    description: "Running tutorials",
                },
            ],
        };

        let resp1 = await apiPOST(`/admin/ddahs`, newDdah);
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload.duties.length).toEqual(newDdah.duties.length);
        expect(computeTotalHoursForDdah(resp1.payload)).toEqual(
            computeTotalHoursForDdah(newDdah)
        );

        // We've passed the insert test, so save the DDAH for later
        Object.assign(ddah, resp1.payload);
    });

    it("get a ddah", async () => {
        let resp1 = await apiGET(`/admin/ddahs/${ddah.id}`);
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload).toMatchObject(ddah);
    });

    it("get all ddahs associated with a session", async () => {
        let resp1 = await apiGET(`/admin/sessions/${session.id}/ddahs`);
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload.length).toEqual(1);
        expect(resp1.payload).toContainObject(ddah);
    });

    it("getting ddahs for one session will not return ddahs for another session", async () => {
        // first create a new session filled with new position, assignment, and contract.
        const newSession = await addSession(
            { apiGET: apiGET, apiPOST: apiPOST },
            { contract_templates: true }
        );
        let resp1 = await api.apiGET(
            `/admin/sessions/${newSession.id}/contract_templates`
        );
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload.length).not.toEqual(0);
        const newContract = resp1.payload[0];

        const newPosition = {
            position_code: "MAT135F",
            position_title: "Calculus I",
            hours_per_assignment: 70,
            start_date: newSession.start_date,
            end_date: newSession.end_date,
            contract_template_id: newContract.id,
        };
        resp1 = await api.apiPOST(
            `/admin/sessions/${newSession.id}/positions`,
            newPosition
        );
        expect(resp1).toHaveStatus("success");
        Object.assign(newPosition, resp1.payload);

        const newAssignment = {
            position_id: newPosition.id,
            applicant_id: appliants[0].id,
            hours: 70,
            start_date: newPosition.start_date,
            end_date: newPosition.end_date,
        };

        resp1 = await apiPOST(`/admin/assignments`, newAssignment);
        expect(resp1).toHaveStatus("success");
        Object.assign(newAssignment, resp1.payload);

        // create a new DDAH
        const newDdah = {
            assignment_id: newAssignment.id,
            duties: [
                {
                    order: 2,
                    hours: 25,
                    description: "Marking the midterm",
                },
            ],
        };

        resp1 = await apiPOST(`/admin/ddahs`, newDdah);
        expect(resp1).toHaveStatus("success");

        // retrieve all ddahs for both sessions
        resp1 = await apiGET(`/admin/sessions/${session.id}/ddahs`);
        expect(resp1).toHaveStatus("success");
        const ddahs = resp1.payload;

        resp1 = await apiGET(`/admin/sessions/${newSession.id}/ddahs`);
        expect(resp1).toHaveStatus("success");
        const newDdahs = resp1.payload;

        // compare two arrays of ddahs do not contain the same ddahs.
        ddahs.forEach((d) => {
            expect(newDdahs).not.toContainObject(d);
        });

        newDdahs.forEach((d) => {
            expect(ddahs).not.toContainObject(d);
        });
    });

    it("modify a ddah", async () => {
        const newDdah = {
            ...ddah,
            duties: [
                {
                    order: 1,
                    hours: 100,
                    description: "Watching Lord of the Rings extended addition",
                },
            ],
        };

        let resp1 = await apiPOST(`/admin/ddahs`, newDdah);
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload.id).toEqual(ddah.id);
        expect(computeTotalHoursForDdah(resp1.payload)).toEqual(100);

        // We've modified this object, so let's keep it up to date
        Object.assign(ddah, resp1.payload);
    });

    it("approve a ddah", async () => {
        // Make sure that the DDAH we have already inserted has not been approved
        expect(ddah.approved_date).toBeFalsy();

        let resp1 = await apiPOST(`/admin/ddahs/${ddah.id}/approve`);
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload.approved_date).toBeTruthy();

        // We've modified this object, so let's keep it up to date
        Object.assign(ddah, resp1.payload);
    });

    it("email a ddah", async () => {
        // Make sure that the DDAH we have already inserted has not been approved
        expect(ddah.emailed_date).toBeFalsy();

        let resp1 = await apiPOST(`/admin/ddahs/${ddah.id}/email`);
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload.emailed_date).toBeTruthy();

        // We've modified this object, so let's keep it up to date
        Object.assign(ddah, resp1.payload);
    });

    it("get ddah from assignment route", async () => {
        let resp1 = await apiGET(
            `/admin/assignments/${ddah.assignment_id}/ddah`
        );
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload).toMatchObject(ddah);
    });

    it("create ddah from assignment route", async () => {
        const newAssignment = assignments[1];
        // When we create a DDAH via the assignments route, we do not need to specify an `assignment_id`
        const newDdah = {
            duties: [
                {
                    order: 1,
                    hours: 200,
                    description: "Walking down memory lane",
                },
            ],
        };
        let resp = await apiPOST(
            `/admin/assignments/${newAssignment.id}/ddah`,
            newDdah
        );
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({
            ...newDdah,
            assignment_id: newAssignment.id,
        });
    });

    it("modifying a signed or approved ddah removes the signature and adds a `revised_date`", async () => {
        const newAssignment = assignments[1];
        let resp = await apiGET(`/admin/assignments/${newAssignment.id}/ddah`);
        expect(resp).toHaveStatus("success");

        let ddah = resp.payload;
        expect(ddah.signature).toBeFalsy();
        expect(ddah.signed_date).toBeFalsy();
        expect(ddah.accepted_date).toBeFalsy();
        expect(ddah.revised_date).toBeFalsy();

        resp = await apiPOST(`/admin/ddahs/${ddah.id}/approve`);
        expect(resp).toHaveStatus("success");
        ddah = resp.payload;
        expect(ddah.approved_date).toBeTruthy();

        // Updating an "approved" DDAH removes the approval
        resp = await apiPOST(`/admin/ddahs`, {
            ...ddah,
            duties: [
                ...ddah.duties,
                {
                    order: 10,
                    description: "Hot-pocket eating contest",
                    hours: 6,
                },
            ],
        });
        expect(resp).toHaveStatus("success");
        expect(resp.payload.approved_date).toBeFalsy();

        // Updating a signed DDAH should remove the signature
        resp = await apiPOST(`/admin/ddahs`, ddah);
        expect(resp).toHaveStatus("success");
        ddah = resp.payload;
        resp = await apiPOST(`/admin/ddahs`, {
            ...ddah,
            signature: "My Sig",
            accepted_date: new Date(),
        });
        expect(resp).toHaveStatus("success");
        let signedDdah = resp.payload;
        expect(signedDdah.signature).toEqual("My Sig");
        expect(signedDdah.accepted_date).toBeTruthy();
        // Update the list of duties
        resp = await apiPOST(`/admin/ddahs`, {
            id: signedDdah.id,
            duties: [
                ...ddah.duties,
                {
                    order: 10,
                    description: "Hot-pocket eating contest",
                    hours: 6,
                },
            ],
        });
        expect(resp).toHaveStatus("success");
        signedDdah = resp.payload;
        expect(signedDdah.signature).toBeFalsy();
        expect(signedDdah.accepted_date).toBeFalsy();
        expect(signedDdah.revised_date).toBeTruthy();
    });
}

/**
 * Email tests actually send emails and expect `mailcatcher` to catch
 * the sent emails. These tests cannot be run with the mock API.
 *
 * @export
 * @param {*} api
 */
export function ddahsEmailAndDownloadTests(api) {
    const { apiGET, apiPOST } = api;
    const MAILCATCHER_BASE_URL = "http://mailcatcher:1080";
    const BACKEND_BASE_URL = "http://backend:3000";
    let assignments = null;
    let ddah = {};
    let session = null;

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        await databaseSeeder.seedForInstructors(api);
        assignments = databaseSeeder.seededData.assignments;
        session = databaseSeeder.seededData.session;
    }, 30000);

    it("can fetch messages from mailcatcher", async () => {
        let resp = await axios.get(`${MAILCATCHER_BASE_URL}/messages`);
        expect(resp.data.length >= 0).toEqual(true);
        // Clear all the messages from mailcatcher
        await axios.delete(`${MAILCATCHER_BASE_URL}/messages`);
        resp = await axios.get(`${MAILCATCHER_BASE_URL}/messages`);
        expect(resp.data.length).toEqual(0);
    });

    it("email makes a round trip", async () => {
        const beforeEmails = (
            await axios.get(`${MAILCATCHER_BASE_URL}/messages`)
        ).data;

        const newDdah = {
            assignment_id: assignments[0].id,
            duties: [
                {
                    order: 2,
                    hours: 25,
                    description: "Marking the midterm",
                },
                {
                    order: 1,
                    hours: 4,
                    description: "Initial training",
                },
                {
                    order: 3,
                    hours: 40,
                    description: "Running tutorials",
                },
            ],
        };

        let resp = await apiPOST(`/admin/ddahs`, newDdah);
        expect(resp).toHaveStatus("success");
        Object.assign(ddah, resp.payload);

        await apiPOST(`/admin/ddahs/${ddah.id}/email`);

        // Wait for mailcatcher to get the email and then search for it.
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const afterEmails = (
            await axios.get(`${MAILCATCHER_BASE_URL}/messages`)
        ).data;

        expect(afterEmails.length).toBeGreaterThan(beforeEmails.length);
    });

    it("can download html and pdf versions of a ddah", async () => {
        const ddahHtml = (
            await axios.get(
                `${BACKEND_BASE_URL}/public/ddahs/${ddah.url_token}`
            )
        ).data;

        expect(ddahHtml).toMatch(/html/);

        // Get the PDF version
        const ddahPdf = (
            await axios.get(
                `${BACKEND_BASE_URL}/public/ddahs/${ddah.url_token}.pdf`
            )
        ).data;
        // All PDF files start with the text "%PDF"
        expect(ddahPdf.slice(0, 4)).toEqual("%PDF");
    });

    it("can download pdf versions ddah signature list", async () => {
        let resp = await apiGET(
            `/admin/sessions/${session.id}/ddahs/accepted_list.pdf`
        );
        expect(resp).toHaveStatus("success");
    });
}
