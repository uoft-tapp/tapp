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

    const newTAData = {
        utorid: "tauser",
        roles: ["ta"],
    };

    const newTAInstructorData = {
        utorid: "tainstuser",
        roles: ["ta", "instructor"],
    };

    async function runTestWithUser(userData, testBody) {
        let respPrevUser = await apiGET("/active_user");
        expect(respPrevUser).toHaveStatus("success");
        const prevUserId = respPrevUser.payload.id;

        let resp = await apiPOST("/admin/users", userData);

        // Set the active user to the newly-created user
        resp = await apiPOST("/debug/active_user", { id: resp.payload.id });
        expect(resp).toHaveStatus("success");

        await testBody();

        // Set the active_user back to the default.
        resp = await apiPOST("/debug/active_user", {
            id: prevUserId,
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
        // the default user has all roles, including the instructor role
        let resp = await apiGET("/instructor/instructors");
        expect(resp).toHaveStatus("success");

        // test instructor route with a user with only the instructor role
        await runTestWithUser(newInstructorData, async () => {
            // Try to fetch an instructor route
            let resp = await apiGET("/instructor/instructors");
            expect(resp).toHaveStatus("success");
        });
    });

    it("A TA can access TA routes", async () => {
        // the default user has all roles, including the TA role
        let resp = await apiGET("/ta/active_user");
        expect(resp).toHaveStatus("success");

        // test instructor route with a user with only the instructor role
        await runTestWithUser(newTAData, async () => {
            // Try to fetch an instructor route
            let resp = await apiGET("/ta/active_user");
            expect(resp).toHaveStatus("success");
        });
    });

    it("An instructor who is also a TA can access instructor and TA routes", async () => {
        // the default user has all roles, including both the instructor role and the TA role
        let resp = await apiGET("/ta/active_user");
        expect(resp).toHaveStatus("success");
        resp = await apiGET("/instructor/instructors");
        expect(resp).toHaveStatus("success");

        // test instructor route with an instructor & TA user
        await runTestWithUser(newTAInstructorData, async () => {
            // Try to fetch an instructor route
            let resp = await apiGET("/ta/active_user");
            expect(resp).toHaveStatus("success");
            resp = await apiGET("/instructor/instructors");
            expect(resp).toHaveStatus("success");
        });
    });
}
