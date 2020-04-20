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
        applicant = null,
        application = null;

    // set up a session to be available before tests run
    beforeAll(async () => {
        await apiPOST("/debug/restore_snapshot");
        session = databaseSeeder.seededData.session;
        applicant = databaseSeeder.seededData.applicant;
        application = databaseSeeder.seededData.application;
        application = {
            ...application,
            session_id: session.id,
            applicant_id: applicant.id
        };
    }, 30000);

    it("fetch applications", async () => {
        // grab the applications of the new session
        const resp = await apiGET(`/admin/sessions/${session.id}/applications`);

        expect(resp).toMatchObject({ status: "success" });

        // console.log("RESPONSE: \n", resp.payload);
        // make sure we got the seeded assignment data
        expect(resp.payload).toMatchObject([application]);

        // check the type of payload
        checkPropTypes(PropTypes.arrayOf(applicationPropTypes), resp.payload);
    });

    it.skip("add an application to a session", async () => {
        const resp = await apiPOST(`/admin/applications`, application.payload);

        expect(resp).toMatchObject({ status: "success" });
        checkPropTypes(applicationPropTypes, resp.payload);
        expect(resp.payload).toMatchObject(application.payload);
    });
}
