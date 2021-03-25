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
        utorid: "user_test_new_user",
        roles: ["instructor"],
    };

    beforeAll(async () => {
        await databaseSeeder.seed(api);
    }, 30000);

    it("Fetches users", async () => {
        const resp = await apiGET("/admin/users");

        expect(resp).toHaveStatus("success");
        checkPropTypes(PropTypes.arrayOf(userPropTypes), resp.payload);
    });

    it("Adds a user", async () => {
        const resp = await apiPOST("/admin/users", newUserData);

        expect(resp).toHaveStatus("success");
        expect(resp.payload.utorid).toEqual(newUserData.utorid);
        // Save any extra attributes we got, such as an `id`
        Object.assign(newUserData, resp.payload);

        const resp2 = await apiGET("/admin/users");
        expect(resp2.payload).toContainObject(newUserData);
    });

    it("Changes a user's role", async () => {
        let resp = await apiPOST("/admin/users", {
            utorid: newUserData.utorid,
            roles: [],
        });

        // Empty the roles (all user will still by default has the ta role,
        // but they will not by default have instructor role)
        expect(resp).toHaveStatus("success");
        expect(resp.payload.roles).toEqual(
            expect.not.arrayContaining(["instructor"])
        );

        // add instructor role to the user
        resp = await apiPOST("/admin/users", {
            id: newUserData.id,
            roles: ["instructor"],
        });
        expect(resp.payload.roles).toEqual(
            expect.arrayContaining(["instructor"])
        );

        // Make sure that we've been saved in the full user list
        resp = await apiGET("/admin/users");
        expect(resp).toHaveStatus("success");
        const updatedUser = resp.payload.find(
            (user) => user.utorid === newUserData.utorid
        );
        expect(updatedUser).toBeDefined();
        expect(updatedUser.roles).toEqual(
            expect.arrayContaining(["instructor"])
        );

        // Save the updated state
        Object.assign(newUserData, updatedUser);
    });

    it("Fetches the active user", async () => {
        const resp = await apiGET("/admin/active_user");

        expect(resp).toHaveStatus("success");
        checkPropTypes(userPropTypes, resp.payload);
    });

    it("[debug only] sets the active user", async () => {
        let resp = await apiPOST("/debug/users", newUserData);
        expect(resp).toHaveStatus("success");

        resp = await apiPOST("/debug/active_user", {
            utorid: newUserData.utorid,
        });
        expect(resp).toHaveStatus("success");

        resp = await apiGET("/debug/active_user");

        expect(resp.payload.utorid).toEqual(newUserData.utorid);

        // Set the active user back to the default so everything
        // is left in a nice state after the tests run.
        resp = await apiPOST("/debug/active_user", {
            id: databaseSeeder.seededData.active_user.id,
        });
    });
}
