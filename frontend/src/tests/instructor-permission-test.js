import { it, expect, beforeAll, checkPropTypes, errorPropTypes } from "./utils";
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

    it("can't update session", async () => {
        const testSessionData = {
            start_date: "2020-02-10T00:00:00.000Z",
            end_date: "2020-02-10T00:00:00.000Z",
            name: "test name",
        };

        let resp = await apiPOST(`/instructor/sessions`, testSessionData);

        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);
    });

    it("fetch positions", async () => {
        let resp = await apiGET(`/instructor/sessions/${session.id}/positions`);
        expect(resp).toHaveStatus("success");
    });

    it("can't update position", async () => {
        let respFetchPos = await apiGET(
            `/instructor/sessions/${session.id}/positions`
        );
        expect(respFetchPos).toHaveStatus("success");
        const prevExistingPosition = respFetchPos.payload[0];
        let updatedPosition = { ...prevExistingPosition };
        updatedPosition.position_title = "changed title - test";

        // test case for instructor should not have route to change position
        let respInvalidRoute = await apiPOST(
            `/instructor/positions`,
            updatedPosition
        );
        expect(respInvalidRoute).toHaveStatus("error");
        //checkPropTypes(errorPropTypes, respInvalidRoute);

        let respReFetchPos = await apiGET(
            `/instructor/sessions/${session.id}/positions`
        );
        expect(respReFetchPos).toHaveStatus("success");
        expect(respReFetchPos.payload).toEqual(respFetchPos.payload);

        // test case for instructor account can not access admin position API
        const newInstOnlyUser = {
            utorid: "test",
            roles: ["instructor"],
        };
        let respAddInstOnlyUser = await apiPOST(
            `/debug/users`,
            newInstOnlyUser
        );
        expect(respAddInstOnlyUser).toHaveStatus("success");

        const respOriginalUser = await apiGET(`/debug/active_user`);
        expect(respOriginalUser).toHaveStatus("success");
        const originalUser = {
            utorid: respOriginalUser.payload.utorid,
            roles: respOriginalUser.payload.roles,
        };

        let respInstOnly = await apiPOST(`/debug/active_user`, newInstOnlyUser);
        expect(respInstOnly).toHaveStatus("success");

        let respInvalidAccess = await apiPOST(
            `/admin/positions`,
            updatedPosition
        );
        expect(respInvalidAccess).toHaveStatus("error");

        let respSwitchBackUser = await apiPOST(
            `/debug/active_user`,
            originalUser
        );
        expect(respSwitchBackUser).toHaveStatus("success");

        let respReFetchPos1 = await apiGET(
            `/instructor/sessions/${session.id}/positions`
        );
        expect(respReFetchPos1).toHaveStatus("success");
        expect(respReFetchPos1.payload).toEqual(respFetchPos.payload);
    });

    it("fetch contract templates", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/contract_templates`
        );
        expect(resp).toHaveStatus("success");
    });

    it("can't update contract template", async () => {
        const testTemplateData = {
            file_name: "test file name",
            content: "test content",
        };

        let resp = await apiPOST(
            `/instructor/sessions/${session.id}/contract_templates`,
            testTemplateData
        );

        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);
    });

    it("can't upload contract template", async () => {
        const testTemplateData = {
            file_name: "test file name",
            content: "test content",
        };

        let resp = await apiPOST(
            `/instructor/contract_templates/upload`,
            testTemplateData
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
        const testApplicantData = {
            utorid: "test utorid",
            student_number: "test student num",
            first_name: "test first name",
            last_name: "test last name",
            email: "test email",
            phone: "test phone num",
        };

        let resp = await apiPOST(
            `/instructor/sessions/${session.id}/applicants`,
            testApplicantData
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
        const testApplicationData = {
            comments: "test app",
            program: "test prog",
            department: "test dept",
            previous_uoft_experience: "test exp",
            yip: 0,
            annotation: "test ann",
            position_preference: [
                {
                    preference_level: 0,
                },
            ],
        };

        let resp = await apiPOST(
            `/instructor/applications`,
            testApplicationData
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
