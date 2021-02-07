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

    const newInstructorOnlyUserData = {
        utorid: "userxx",
        roles: ["instructor"],
    };

    const newTAOnlyUserData = {
        utorid: "tauser",
        roles: ["ta"],
    };

    const newTAInstructorUserData = {
        utorid: "tainstuser",
        roles: ["ta", "instructor"],
    };

    /**
     * Switch current active user to the user represented by the given user data. If given user does not exist, one will
     * be created.
     * @param userData the user to be set to the active user
     * @returns {Promise<void>}
     */
    async function switchToTargetUser(userData) {
        let resp = await apiPOST("/debug/users", userData);
        expect(resp).toHaveStatus("success");

        // Set the active user to the newly-created user
        resp = await apiPOST("/debug/active_user", { id: resp.payload.id });
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
        const respOriginalUser = await apiGET(`/debug/active_user`);
        expect(respOriginalUser).toHaveStatus("success");
        defaultUser = {
            utorid: respOriginalUser.payload.utorid,
            roles: respOriginalUser.payload.roles,
        };
    }, 30000);

    afterEach(async () => {
        await restoreDefaultUser();
    }, 3000);

    it("Admin user can access admin route", async () => {
        // the default user has all roles, including the admin role
        let resp = await apiGET("/admin/active_user");
        expect(resp).toHaveStatus("success");
    });

    it("A non-admin cannot access the admin route", async () => {
        await switchToTargetUser(newInstructorOnlyUserData);

        // Try to fetch an admin route
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
    });

    it("An instructor can access instructor routes", async () => {
        // the default user has all roles, including the instructor role
        let resp = await apiGET("/instructor/instructors");
        expect(resp).toHaveStatus("success");

        // switch to instructor only user
        await switchToTargetUser(newInstructorOnlyUserData);
        resp = await apiGET("/instructor/instructors");
        expect(resp).toHaveStatus("success");
    });

    it("A TA can access TA routes", async () => {
        // the default user has all roles, including the TA role
        let resp = await apiGET("/ta/active_user");
        expect(resp).toHaveStatus("success");

        await switchToTargetUser(newTAOnlyUserData);

        // Try to fetch an instructor route
        resp = await apiGET("/ta/active_user");
        expect(resp).toHaveStatus("success");
    });

    it("An instructor who is also a TA can access instructor and TA routes", async () => {
        // the default user has all roles, including both the instructor role and the TA role
        let resp = await apiGET("/ta/active_user");
        expect(resp).toHaveStatus("success");
        resp = await apiGET("/instructor/instructors");
        expect(resp).toHaveStatus("success");

        await switchToTargetUser(newTAInstructorUserData);

        // Try to fetch an instructor route
        resp = await apiGET("/ta/active_user");
        expect(resp).toHaveStatus("success");
        resp = await apiGET("/instructor/instructors");
        expect(resp).toHaveStatus("success");
    });
}
