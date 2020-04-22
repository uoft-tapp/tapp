import PropTypes from "prop-types";
import { checkPropTypes, expect, it, beforeAll, userPropTypes } from "./utils";
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
export function usersTests(api) {
    const { apiGET, apiPOST } = api;

    const newUserData = {
        utorid: "userxx",
        roles: ["instructor"]
    };

    beforeAll(async () => {
        await apiPOST("/debug/restore_snapshot");
    }, 30000);

    it("Fetches users", async () => {
        const resp = await apiGET("/admin/users");

        expect(resp).toMatchObject({ status: "success" });
        checkPropTypes(PropTypes.arrayOf(userPropTypes), resp.payload);
    });

    it("Adds a user", async () => {
        const resp = await apiPOST("/admin/users", newUserData);

        expect(resp).toMatchObject({ status: "success" });
        expect(resp.payload).toMatchObject(newUserData);
        // Save any extra attributes we got, such as an `id`
        Object.assign(newUserData, resp.payload);

        const resp2 = await apiGET("/admin/users");
        expect(resp2.payload).toContainObject(newUserData);
    });

    it("Changes a user's role", async () => {
        let resp = await apiPOST("/admin/users", {
            id: newUserData.id,
            roles: []
        });

        // Empty the roles
        expect(resp).toMatchObject({ status: "success" });
        expect(resp.payload.roles).toEqual([]);

        // Set the roles to "ta" only
        resp = await apiPOST("/admin/users", {
            id: newUserData.id,
            roles: ["ta"]
        });
        expect(resp.payload.roles).toEqual(["ta"]);

        // Make sure that we've been saved in the full user list
        resp = await apiGET("/admin/users");
        const ta = resp.payload.find(x => x.id === newUserData.id);
        expect(ta).toEqual({ ...newUserData, roles: ["ta"] });

        // Save the updated state
        Object.assign(newUserData, ta);
    });

    it("Fetches the active user", async () => {
        const resp = await apiGET("/admin/active_user");

        expect(resp).toMatchObject({ status: "success" });
        checkPropTypes(userPropTypes, resp.payload);
    });

    it("[debug only] sets the active user", async () => {
        let resp = await apiPOST("/debug/active_user", { id: newUserData.id });
        expect(resp).toMatchObject({ status: "success" });

        resp = await apiGET("/debug/active_user");

        expect(resp.payload).toEqual(newUserData);

        // Set the active user back to the default so everything
        // is left in a nice state after the tests run.
        resp = await apiPOST("/debug/active_user", {
            id: databaseSeeder.seededData.active_user.id
        });
    });
}
