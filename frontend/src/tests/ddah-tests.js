/**
 * @jest-environment node
 */
import { it, expect, beforeAll } from "./utils";
import { databaseSeeder } from "./setup";

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
    let resp1;
    let session = null;
    let assignments = null;
    let ddah = {};

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        await databaseSeeder.seedForInstructors(api);
        session = databaseSeeder.seededData.session;
        assignments = databaseSeeder.seededData.assignments;
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

        resp1 = await apiPOST(`/admin/ddahs`, newDdah);
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload.duties.length).toEqual(newDdah.duties.length);
        expect(computeTotalHoursForDdah(resp1.payload)).toEqual(
            computeTotalHoursForDdah(newDdah)
        );

        // We've passed the insert test, so save the DDAH for later
        Object.assign(ddah, resp1.payload);
    });

    it("get a ddah", async () => {
        resp1 = await apiGET(`/admin/ddahs/${ddah.id}`);
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload).toMatchObject(ddah);
    });

    it("get all ddahs associated with a session", async () => {
        resp1 = await apiGET(`/admin/sessions/${session.id}/ddahs`);
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload).toContainObject(ddah);
    });

    it.todo(
        "getting ddahs for one session will not return ddahs for another session"
    );

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

        resp1 = await apiPOST(`/admin/ddahs`, newDdah);
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload.id).toEqual(ddah.id);
        expect(computeTotalHoursForDdah(resp1.payload)).toEqual(100);

        // We've modified this object, so let's keep it up to date
        Object.assign(ddah, resp1.payload);
    });

    it("approve a ddah", async () => {
        // Make sure that the DDAH we have already inserted has not been approved
        expect(ddah.approved_date).toBeFalsy();

        resp1 = await apiPOST(`/admin/ddahs/${ddah.id}/approve`);
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload.approved_date).toBeTruthy();

        // We've modified this object, so let's keep it up to date
        Object.assign(ddah, resp1.payload);
    });

    it("email a ddah", async () => {
        // Make sure that the DDAH we have already inserted has not been approved
        expect(ddah.emailed_date).toBeFalsy();

        resp1 = await apiPOST(`/admin/ddahs/${ddah.id}/email`);
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload.emailed_date).toBeTruthy();

        // We've modified this object, so let's keep it up to date
        Object.assign(ddah, resp1.payload);
    });

    it("get ddah from assignment route", async () => {
        resp1 = await apiGET(`/admin/assignments/${ddah.assignment_id}/ddah`);
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
        resp1 = await apiPOST(
            `/admin/assignments/${newAssignment.id}/ddah`,
            newDdah
        );
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload).toMatchObject({
            ...newDdah,
            assignment_id: newAssignment.id,
        });
    });

    it.todo(
        "modifying a signed ddah removes the signature and adds a `revised_date`"
    );
}
