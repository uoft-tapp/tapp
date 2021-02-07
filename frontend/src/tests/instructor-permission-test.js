import { it, expect, beforeAll, checkPropTypes, errorPropTypes } from "./utils";
import { databaseSeeder } from "./setup";
import { de } from "chrono-node";

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
    let instructorOnlyUser;
    let defaultUser;

    async function switchToInstructorOnlyUser() {
        let respSwitchToInstOnlyUser = await apiPOST(
            `/debug/active_user`,
            instructorOnlyUser
        );
        expect(respSwitchToInstOnlyUser).toHaveStatus("success");
    }

    async function restoreDefaultUser() {
        let respSwitchBackUser = await apiPOST(
            `/debug/active_user`,
            defaultUser
        );
        expect(respSwitchBackUser).toHaveStatus("success");
    }

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        await databaseSeeder.seedForInstructors(api);
        session = databaseSeeder.seededData.session;
        instructorOnlyUser = {
            utorid: "test",
            roles: ["instructor"],
        };

        let respAddInstOnlyUser = await apiPOST(
            `/debug/users`,
            instructorOnlyUser
        );
        expect(respAddInstOnlyUser).toHaveStatus("success");

        const respOriginalUser = await apiGET(`/debug/active_user`);
        expect(respOriginalUser).toHaveStatus("success");
        defaultUser = {
            utorid: respOriginalUser.payload.utorid,
            roles: respOriginalUser.payload.roles,
        };
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

    it("can't update instructors except for self (i.e. active user)", async () => {
        // we use the default user's admin privilege here to fetch an unrelated instructor
        let respFetchInst = await apiGET(`/instructor/instructors`);
        expect(respFetchInst).toHaveStatus("success");

        let respFetchDefaultUser = await apiGET(`/instructor/active_user`);
        expect(respFetchDefaultUser).toHaveStatus("success");
        const defaultUser = respFetchDefaultUser.payload;

        const newDefaultUser = { ...defaultUser };
        newDefaultUser.email = "test@test.com";

        // instructor can not modify other instructors
        await switchToInstructorOnlyUser();
        let respInvalidRouteWithSession = await apiPOST(
            `/instructor/instructors`,
            newDefaultUser
        );
        expect(respInvalidRouteWithSession).toHaveStatus("error");
        checkPropTypes(errorPropTypes, respInvalidRouteWithSession);

        await restoreDefaultUser();

        // instructors can modify themselves
        let respModDefaultUser = await apiPOST(
            `/instructor/instructors`,
            newDefaultUser
        );
        expect(respModDefaultUser).toHaveStatus("success");
        expect(respModDefaultUser.payload.email).toEqual("test@test.com");
    });

    it("fetch sessions", async () => {
        let resp = await apiGET("/instructor/sessions");
        expect(resp).toHaveStatus("success");
    });

    it("can't update session", async () => {
        await switchToInstructorOnlyUser();

        const newSession = {
            start_date: "2020-01-01",
            end_date: "2020-01-02",
            name: "test",
        };

        let resp = await apiPOST("/instructor/sessions", newSession);
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);

        resp = await apiPOST("/admin/sessions", newSession);
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);

        await restoreDefaultUser();
    });

    it("fetch positions", async () => {
        let resp = await apiGET(`/instructor/sessions/${session.id}/positions`);
        expect(resp).toHaveStatus("success");
    });

    it("can't update position", async () => {
        await switchToInstructorOnlyUser();

        const newPosition = {
            position_code: "test code",
            position_title: "Test Position",
            start_date: "2020-01-01",
            end_date: "2020-01-02",
            hours_per_assignment: 1.0,
            contract_template_id: 190,
            qualifications: null,
            duties: "Tutorials",
            ad_hours_per_assignment: null,
            ad_num_assignments: null,
            ad_open_date: null,
            ad_close_date: null,
            desired_num_assignments: null,
            current_enrollment: null,
            current_waitlisted: null,
            instructor_ids: [89],
        };

        let resp = await apiPOST(
            `/instructor/sessions/${session.id}/positions`,
            newPosition
        );
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);

        resp = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            newPosition
        );
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);

        resp = await apiPOST(`/admin/positions`, newPosition);
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);

        resp = await apiPOST(`/instructor/positions`, newPosition);
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);

        await restoreDefaultUser();
    });

    it("fetch contract templates", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/contract_templates`
        );
        expect(resp).toHaveStatus("success");
    });

    it("can't update contract template", async () => {
        await switchToInstructorOnlyUser();

        const newTemplate = {
            template_file: "default-template.html",
            template_name: "Test",
        };

        let resp = await apiPOST(
            `/instructor/sessions/${session.id}/contract_templates`,
            newTemplate
        );
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);

        resp = await apiPOST(
            `/admin/sessions/${session.id}/contract_templates`,
            newTemplate
        );
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);

        await restoreDefaultUser();
    });

    it("fetch applicants", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/applicants`
        );
        expect(resp).toHaveStatus("success");
    });

    it("can't update applicants", async () => {
        await switchToInstructorOnlyUser();

        const newApplicant = {
            first_name: "Test",
            last_name: "Test",
            email: "test@test.com",
            phone: "1111111111",
            utorid: "test",
            student_number: "1111111",
        };

        let resp = await apiPOST(
            `/instructor/sessions/${session.id}/applicants`,
            newApplicant
        );
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);

        resp = await apiPOST(
            `/admin/sessions/${session.id}/applicants`,
            newApplicant
        );
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);

        resp = await apiPOST(`/admin/applicants`, newApplicant);
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);

        resp = await apiPOST(`/instructor/applicants`, newApplicant);
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);

        await restoreDefaultUser();
    });

    it("fetch assignments", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/assignments`
        );
        expect(resp).toHaveStatus("success");
    });

    it("can't update applications", async () => {
        await switchToInstructorOnlyUser();

        const newApplication = {
            comments: "Test comment",
            program: null,
            department: null,
            previous_uoft_experience: null,
            yip: null,
            annotation: null,
        };

        let resp = await apiPOST(`/instructor/applications`, newApplication);
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);

        resp = await apiPOST(`/admin/applications`, newApplication);
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);

        await restoreDefaultUser();
    });

    it("fetch applications", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/applications`
        );
        expect(resp).toHaveStatus("success");
    });

    it.todo("fetch Ddahs");
    it.todo("fetch Ddahs a position associated with self");
    it.todo("fetch Ddahs an assignment associated with self");
    it.todo("cannot fetch Ddahs for assignment not associated with self");
    it.todo("create a Ddah for an assignment associated with self");
    it.todo("update a Ddah for an assignment associated with self");
    it.todo(
        "cannot set approved_date/accepted_date/revised_date/emailed_ate/signature for a Ddah associated with self"
    );
    it.todo("cannot create a Ddah for an assignment not associated with self");
    it.todo("cannot update a Ddah for an assignment not associated with self");
}
