import { expect, it, beforeAll, afterEach } from "./utils";
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

    let defaultUser;

    const instructorOnlyUserData = {
        utorid: "user_permission_test_instructor_only_utorid",
        roles: ["instructor"],
    };

    const TAOnlyUserData = {
        utorid: "user_permission_test_ta_only_utorid",
        roles: ["ta"],
    };

    const TAInstructorUserData = {
        utorid: "user_permission_test_ta_and_instructor_utorid",
        roles: ["ta", "instructor"],
    };

    /**
     * Switch current active user to the user represented by the given user data. If given user does not exist, one will
     * be created.
     * @param newActiveUser the user to be set to the active user
     * @returns {Promise<void>}
     */
    async function switchToTargetUser(newActiveUser) {
        // Set the active user to the target user
        let resp = await apiPOST("/debug/active_user", newActiveUser);
        expect(resp).toHaveStatus("success");
    }

    /**
     * Restores the active user to the default user (the user logged during test setup in beforeAll).
     *
     * @returns {Promise<void>}
     */
    async function restoreDefaultUser() {
        let respSwitchBackUser = await apiPOST(
            `/debug/active_user`,
            defaultUser
        );
        expect(respSwitchBackUser).toHaveStatus("success");
    }

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        let resp = await apiGET(`/debug/active_user`);
        expect(resp).toHaveStatus("success");
        defaultUser = {
            utorid: resp.payload.utorid,
            roles: resp.payload.roles,
        };

        resp = await apiPOST("/debug/users", instructorOnlyUserData);
        expect(resp).toHaveStatus("success");

        resp = await apiPOST("/debug/users", TAOnlyUserData);
        expect(resp).toHaveStatus("success");

        resp = await apiPOST("/debug/users", TAInstructorUserData);
        expect(resp).toHaveStatus("success");
    }, 30000);

    it("Admin user can access admin route", async () => {
        // the default user has all roles, including the admin role
        let resp = await apiGET("/admin/active_user");
        expect(resp).toHaveStatus("success");
    });

    it("A non-admin cannot access the admin route", async () => {
        await switchToTargetUser(instructorOnlyUserData);

        // Try to fetch admin routes
        let resp = await apiGET("/admin/active_user");
        expect(resp).toHaveStatus("error");

        resp = await apiGET("/admin/instructors");
        expect(resp).toHaveStatus("error");

        resp = await apiGET("/admin/sessions");
        expect(resp).toHaveStatus("error");

        resp = await apiGET("/admin/users");
        expect(resp).toHaveStatus("error");

        resp = await apiGET("/admin/applicants");
        expect(resp).toHaveStatus("error");

        await restoreDefaultUser();
    });

    it("An instructor can access instructor routes", async () => {
        // the default user has all roles, including the instructor role
        let resp = await apiGET("/instructor/instructors");
        expect(resp).toHaveStatus("success");

        // switch to instructor only user
        await switchToTargetUser(instructorOnlyUserData);
        resp = await apiGET("/instructor/instructors");
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
    });

    it("A TA can access TA routes", async () => {
        // the default user has all roles, including the TA role
        let resp = await apiGET("/ta/active_user");
        expect(resp).toHaveStatus("success");

        await switchToTargetUser(TAOnlyUserData);

        // Try to fetch a TA route
        resp = await apiGET("/ta/active_user");
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
    });

    it("An instructor who is also a TA can access instructor and TA routes", async () => {
        // the default user has all roles, including both the instructor role and the TA role
        let resp = await apiGET("/ta/active_user");
        expect(resp).toHaveStatus("success");
        resp = await apiGET("/instructor/instructors");
        expect(resp).toHaveStatus("success");

        await switchToTargetUser(TAInstructorUserData);

        // Try to fetch a TA route
        resp = await apiGET("/ta/active_user");
        expect(resp).toHaveStatus("success");

        // try to fetch instructor routes
        resp = await apiGET("/instructor/instructors");
        expect(resp).toHaveStatus("success");

        resp = await apiGET("/instructor/active_user");
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
    });
}
