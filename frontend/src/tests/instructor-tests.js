import PropTypes from "prop-types";
import {
    it,
    expect,
    beforeAll,
    checkPropTypes,
    instructorPropTypes
} from "./utils";
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
export function instructorsTests(api) {
    const { apiGET, apiPOST } = api;
    let instructor = null;

    beforeAll(async () => {
        await databaseSeeder.seed(api);
    }, 30000);

    it("fetch instructors", async () => {
        const resp = await apiGET("/admin/instructors");
        expect(resp).toHaveStatus("success");

        // check the type of payload
        checkPropTypes(PropTypes.arrayOf(instructorPropTypes), resp.payload);
    });

    it("create instructor", async () => {
        const newInstructorData = {
            first_name: "Anand",
            last_name: "Liu",
            email: "anand.liu.sample@utoronto.ca",
            utorid: "anandl"
        };

        // create a new instructor
        const resp1 = await apiPOST(`/admin/instructors`, newInstructorData);
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload).toMatchObject(newInstructorData);
        checkPropTypes(instructorPropTypes, resp1.payload);

        // make sure instructor is on instructor list
        const resp2 = await apiGET(`/admin/instructors`);
        expect(resp2).toHaveStatus("success");
        expect(resp2.payload).toContainObject(newInstructorData);

        // set instructor to used by later test
        instructor = resp1.payload;
    });

    it.skip("update an instructor", async () => {
        const updateInstructorData = {
            id: instructor.id,
            email: "anand.liu@gmail.com"
        };

        // update the instructor
        const resp = await apiPOST(`/instructors`, updateInstructorData);
        expect(resp).toMatchObject({ status: "success" });
        expect(resp.payload).toMatchObject(updateInstructorData);
    });

    // delete an instructor
    it.skip("delete instructor", async () => {
        const resp1 = await apiPOST(`/instructors/delete`, instructor);
        expect(resp1).toMatchObject({
            status: "success",
            payload: { id: instructor.id }
        });

        // make sure the instructor is deleted
        const resp2 = await apiGET("/instructors");
        expect(resp2).toMatchObject({ status: "success" });
        checkPropTypes(PropTypes.arrayOf(instructorPropTypes), resp2.payload);
        expect(resp2).not.toContainObject(instructor);
    });

    it.todo("fail to delete instructor from a position with invalid id");
}
