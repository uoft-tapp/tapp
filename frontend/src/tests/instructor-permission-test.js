import { it, expect, beforeAll } from "./utils";
import { databaseSeeder } from "./setup";

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
export function instructorsPermissionTests(api) {
    // eslint-disable-next-line
    const { apiGET, apiPOST } = api;
    let session = null;

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        await databaseSeeder.seedForInstructors(api);
        session = databaseSeeder.seededData.session;
    }, 30000);

    it("fetch instructors", async () => {
        // Get instructors from the admin route
        let resp = await apiGET("/admin/instructors");
        expect(resp).toHaveStatus("success");
        // All the seeded instructors should be listed
        expect(resp.payload).toContainObject({
            utorid: "smithh",
        });
        expect(resp.payload).toContainObject({
            utorid: "garciae",
        });
        expect(resp.payload).toContainObject({
            utorid: "millerm",
        });

        // "smithh" and "garciae" teach together, but don't teach with "millerm",
        // so when "smithh" requests a list of instructors, they should get a list
        // that contains only the instructor they co-teach with.
        resp = await apiGET("/instructor/instructors");
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toContainObject({
            utorid: "smithh",
        });
        expect(resp.payload).toContainObject({
            utorid: "garciae",
        });
        expect(resp.payload).not.toContainObject({
            utorid: "millerm",
        });
    });

    it.todo("can't update instructors except for self (i.e. active user)");

    it("fetch sessions", async () => {
        let resp = await apiGET("/instructor/instructors");
        expect(resp).toHaveStatus("success");
    });

    it.todo("can't update session");

    it("fetch positions", async () => {
        let resp = await apiGET(`/instructor/sessions/${session.id}/positions`);
        expect(resp).toHaveStatus("success");
    });

    it.todo("can't update position");

    it("fetch contract templates", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/contract_templates`
        );
        expect(resp).toHaveStatus("success");
    });

    it.todo("can't update contract template");

    it("fetch applicants", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/applicants`
        );
        expect(resp).toHaveStatus("success");
    });

    it.todo("can't update applicants");

    it("fetch assignments", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/assignments`
        );
        expect(resp).toHaveStatus("success");
    });

    it.todo("can't update applications");

    it("fetch applications", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/applications`
        );
        expect(resp).toHaveStatus("success");
    });

    it.todo("fetch Ddahs");
    it.todo("fetch Ddahs a position associated with self");
    it.todo("fetch Ddahs an assignment associated with self");
    it.todo("cannot fetch Ddahs for assignment not associated with self");
    it.todo("create a Ddah for an assignment associated with self");
    it.todo("update a Ddah for an assignment associated with self");
    it.todo(
        "cannot set approved_date/accepted_date/revised_date/emailed_ate/signature for a Ddah associated with self"
    );
    it.todo("cannot create a Ddah for an assignment not associated with self");
    it.todo("cannot update a Ddah for an assignment not associated with self");
}
