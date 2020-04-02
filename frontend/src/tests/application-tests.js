// TODO: Remove eslint disable
// eslint-disable-next-line
import PropTypes from "prop-types";
import {
    applicationPropTypes,
    expect,
    beforeAll,
    it,
    checkPropTypes
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
export function applicationsTests(api) {
    const { apiGET, apiPOST } = api;
    let session = null,
        applicant = null;

    const newApplicationData = {
        comments: "",
        program: "Phd",
        department: "Computer Science",
        previous_uoft_ta_experience: "Last year I TAed a bunch",
        yip: 2,
        annotation: "",
        position_preferences: [
            {
                preference_level: 2,
                position_id: 10
            },
            {
                preference_level: 3,
                position_id: 15
            }
        ]
    };

    // set up a session to be available before tests run
    beforeAll(async () => {
        await apiPOST("/debug/restore_snapshot");
        session = databaseSeeder.seededData.session;
        applicant = databaseSeeder.seededData.applicant;
        newApplicationData.session_id = session.id;
        newApplicationData.applicant_id = applicant.id;
    }, 30000);

    it("fetch applications", async () => {
        // grab the applications of the new session
        const resp1 = await apiGET(
            `/admin/sessions/${session.id}/applications`
        );

        expect(resp1).toMatchObject({ status: "success" });

        // check the type of payload
        checkPropTypes(PropTypes.arrayOf(applicationPropTypes), resp1.payload);
    });

    it("add an application to a session", async () => {
        const resp2 = await apiPOST(`/admin/applications`, newApplicationData);

        expect(resp2).toMatchObject({ status: "success" });
        checkPropTypes(applicationPropTypes, resp2.payload);
        expect(resp2.payload).toMatchObject(newApplicationData);
    });
}
