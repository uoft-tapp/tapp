import { expect, it, beforeAll } from "./utils";
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
export function userPermissionsTests(api) {
    const { apiGET, apiPOST } = api;

    const newInstructorData = {
        utorid: "userxx",
        roles: ["instructor"],
    };

    async function runTestWithUser(userData, testBody) {
        let resp = await apiPOST("/admin/users", userData);
        // Save any extra attributes we got, such as an `id`
        Object.assign(userData, resp.payload);

        // Set the active user to the newly-created user
        resp = await apiPOST("/debug/active_user", { id: userData.id });
        expect(resp).toHaveStatus("success");

        await testBody();

        // Set the active_user back to the default.
        resp = await apiPOST("/debug/active_user", {
            id: databaseSeeder.seededData.active_user.id,
        });
        expect(resp).toHaveStatus("success");
    }

    beforeAll(async () => {
        await databaseSeeder.seed(api);
    }, 30000);

    it("Admin user can access admin route", async () => {
        // the default user has all roles, including the admin role
        const resp = await apiGET("/admin/active_user");
        expect(resp).toHaveStatus("success");
    });

    it("A non-admin cannot access the admin route", async () => {
        await runTestWithUser(newInstructorData, async () => {
            // Try to fetch an admin route
            let resp = await apiGET("/admin/active_user");
            expect(resp).toHaveStatus("error");
        });
    });

    it("An instructor can access instructor routes", async () => {
        // test instructor route with a user with only the instructor role
        await runTestWithUser(newInstructorData, async () => {
            // Try to fetch an instructor route
            let resp = await apiGET("/instructor/instructors");
            expect(resp).toHaveStatus("success");
        });
    });

    it.todo("A TA can access TA routes");
    it.todo(
        "An instructor who is also a TA can access instructor and TA routes"
    );
}
