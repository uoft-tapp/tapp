import {it, expect, beforeAll, checkPropTypes, errorPropTypes} from "./utils";
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

    it("can't update contract template", async () => {
        const invalidTemplateData = {
            "file_name": "invalid file name",
            "content": "invalid content"
        };

        let resp = await apiPOST(
            `/instructor/sessions/${session.id}/contract_templates`,
            invalidTemplateData
        );

        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);
    });

    it("can't upload contract template", async () => {
        const invalidTemplateData = {
            "file_name": "invalid file name",
            "content": "invalid content"
        };

        let resp = await apiPOST(
            `/instructor/contract_templates/upload`,
            invalidTemplateData
        );

        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);
    });

    it("fetch applicants", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/applicants`
        );
        expect(resp).toHaveStatus("success");
    });

    it("can't update applicants", async () => {
        const invalidApplicantData = {
            "utorid": "invalid utorid",
            "student_number": "invalid student num",
            "first_name": "invalid first name",
            "last_name": "invalid last name",
            "email": "invalid email",
            "phone": "invalid phone num"
        };

        let resp = await apiPOST(
            `/instructor/sessions/${session.id}/applicants`,
            invalidApplicantData
        );

        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);
    });

    it("fetch assignments", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/assignments`
        );
        expect(resp).toHaveStatus("success");
    });

    it("can't update applications", async () => {
        const invalidApplicationData = {
            "comments": "invalid app",
            "program": "invalid prog",
            "department": "invalid dept",
            "previous_uoft_experience": "invalid exp",
            "yip": 0,
            "annotation": "invalid ann",
            "position_preference": [
                {
                    "preference_level": 0
                }
            ]
        };

        let resp = await apiPOST(
            `/instructor/applications`,
            invalidApplicationData
        );

        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);
    });

    it("fetch applications", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/applications`
        );
        expect(resp).toHaveStatus("success");
    });
}
