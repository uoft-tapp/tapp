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
    let instructorOnlyUser;
    let defaultUser;
    let existingContractTemplateId;

    /**
     * Switches the current active user to a user with only the instructor role.
     * This function uses debug route to achieve user switching.
     *
     * @returns {Promise<void>}
     */
    async function switchToInstructorOnlyUser() {
        let respSwitchToInstOnlyUser = await apiPOST(
            `/debug/active_user`,
            instructorOnlyUser
        );
        expect(respSwitchToInstOnlyUser).toHaveStatus("success");
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
        await databaseSeeder.seedForInstructors(api);
        session = databaseSeeder.seededData.session;

        // default user should have both admin and instructor roles
        let resp = await apiGET(`/debug/active_user`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload.roles).toEqual(
            expect.arrayContaining(["instructor", "admin"])
        );
        defaultUser = resp.payload;

        resp = await apiGET(`/admin/sessions/${session.id}/contract_templates`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toEqual(
            expect.arrayContaining([expect.anything()])
        );
        existingContractTemplateId = resp.payload[0].id;

        const instructorOnlyUserData = {
            utorid: "instructor_only_test_user_utorid",
            roles: ["instructor"],
        };

        resp = await apiPOST(`/debug/users`, instructorOnlyUserData);
        expect(resp).toHaveStatus("success");

        resp = await apiGET(`/debug/users`);
        expect(resp).toHaveStatus("success");

        resp.payload.forEach((user) => {
            if (user.utorid === instructorOnlyUserData.utorid) {
                expect(user.roles).toEqual(["instructor"]);
                instructorOnlyUser = user;
            }
        });

        expect(instructorOnlyUser).toBeDefined();
    }, 30000);

    it("assigning to be instructor of a course grants instructor role", async () => {
        await restoreDefaultUser();
        const emptyRoleUserData = {
            utorid: "course_assign_grant_instructor_test_user_utorid",
            roles: [],
        };

        let resp = await apiPOST(`/debug/users`, emptyRoleUserData);
        expect(resp).toHaveStatus("success");

        resp = await apiGET(`/debug/users`);
        expect(resp).toHaveStatus("success");

        let emptyRoleUserId;
        resp.payload.forEach((user) => {
            if (user.utorid === emptyRoleUserData.utorid) {
                emptyRoleUserId = user.id;
            }
        });

        expect(emptyRoleUserId).toBeDefined();

        const defaultTestPosition = {
            position_code: "course_assign_grant_instructor_test_position_code",
            position_title:
                "course assign grant instructor test position title",
            hours_per_assignment: 1.0,
            contract_template_id: existingContractTemplateId,
            duties: "Tutorials",
            instructor_ids: [emptyRoleUserId],
        };

        // upon successfully making the following position upsert, the no-role user should be granted instructor role
        resp = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            defaultTestPosition
        );
        expect(resp).toHaveStatus("success");

        resp = await apiGET(`/debug/users`);
        expect(resp).toHaveStatus("success");

        let assignedInstructorRoleUser;
        resp.payload.forEach((user) => {
            if (user.id === emptyRoleUserId) {
                expect(user.roles).toEqual(
                    expect.arrayContaining(["instructor"])
                );
                assignedInstructorRoleUser = user;
            }
        });

        expect(assignedInstructorRoleUser).toBeDefined();
    });

    it("fetch instructors", async () => {
        await restoreDefaultUser();
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

        const defaultUserWithUpdatedInformation = { ...defaultUser };
        defaultUserWithUpdatedInformation.email =
            "instructor_permission_instructor_update_test@test.com";

        // instructor can not modify other instructors
        // in this example, the instructor only user cant update default user's information
        await switchToInstructorOnlyUser();
        let respInvalidRouteWithSession = await apiPOST(
            `/instructor/instructors`,
            defaultUserWithUpdatedInformation
        );
        expect(respInvalidRouteWithSession).toHaveStatus("error");
        checkPropTypes(errorPropTypes, respInvalidRouteWithSession);

        await restoreDefaultUser();

        // instructors can modify themselves
        let respModDefaultUser = await apiPOST(
            `/instructor/instructors`,
            defaultUserWithUpdatedInformation
        );
        expect(respModDefaultUser).toHaveStatus("success");
        expect(respModDefaultUser.payload.email).toEqual(
            "instructor_permission_instructor_update_test@test.com"
        );
    });

    it("fetch sessions", async () => {
        await switchToInstructorOnlyUser();
        let resp = await apiGET("/instructor/sessions");
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
        resp = await apiGET("/instructor/sessions");
        expect(resp).toHaveStatus("success");
    });

    it("can't update session", async () => {
        await switchToInstructorOnlyUser();

        const newSession = {
            start_date: "2020-04-10T01:00:00.000Z",
            end_date: "2020-11-31T00:01:20.000Z",
            name: "instructor_permission_cant_update_session_test_session",
        };

        let resp = await apiPOST("/instructor/sessions", newSession);
        expect(resp).toHaveStatus("error");

        resp = await apiPOST("/admin/sessions", newSession);
        expect(resp).toHaveStatus("error");

        await restoreDefaultUser();
    });

    it("fetch positions", async () => {
        await switchToInstructorOnlyUser();
        let resp = await apiGET(`/instructor/sessions/${session.id}/positions`);
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
        resp = await apiGET(`/instructor/sessions/${session.id}/positions`);
        expect(resp).toHaveStatus("success");
    });

    it("can't update position", async () => {
        await switchToInstructorOnlyUser();

        const newPosition = {
            position_code:
                "instructor_permission_cant_update_position_test_code",
            position_title:
                "instructor permission cant update position test position",
            hours_per_assignment: 1.0,
            contract_template_id: existingContractTemplateId,
            duties: "Tutorials",
        };

        let resp = await apiPOST(
            `/instructor/sessions/${session.id}/positions`,
            newPosition
        );
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            newPosition
        );
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(`/admin/positions`, newPosition);
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(`/instructor/positions`, newPosition);
        expect(resp).toHaveStatus("error");

        await restoreDefaultUser();
    });

    it("fetch contract templates", async () => {
        await switchToInstructorOnlyUser();
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/contract_templates`
        );
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
        resp = await apiGET(
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

        resp = await apiPOST(
            `/admin/sessions/${session.id}/contract_templates`,
            newTemplate
        );
        expect(resp).toHaveStatus("error");

        await restoreDefaultUser();
    });

    it("fetch applicants", async () => {
        await switchToInstructorOnlyUser();
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/applicants`
        );
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
        resp = await apiGET(`/instructor/sessions/${session.id}/applicants`);
        expect(resp).toHaveStatus("success");
    });

    it("can't update applicants", async () => {
        await switchToInstructorOnlyUser();

        const newApplicant = {
            first_name:
                "instructor_permission_test_cant_update_applicant_test_first_name",
            last_name:
                "instructor_permission_test_cant_update_applicant_test_last_name",
            email:
                "instructor_permission_test_cant_update_applicant_test@test.com",
            phone: "1111111111",
            utorid:
                "instructor_permission_test_cant_update_applicant_test_utorid",
            student_number: "1111111",
        };

        let resp = await apiPOST(
            `/instructor/sessions/${session.id}/applicants`,
            newApplicant
        );
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(
            `/admin/sessions/${session.id}/applicants`,
            newApplicant
        );
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(`/admin/applicants`, newApplicant);
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(`/instructor/applicants`, newApplicant);
        expect(resp).toHaveStatus("error");

        await restoreDefaultUser();
    });

    it("fetch assignments", async () => {
        await switchToInstructorOnlyUser();
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/applicants`
        );
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
        resp = await apiGET(`/instructor/sessions/${session.id}/assignments`);
        expect(resp).toHaveStatus("success");
    });

    it("can't update applications", async () => {
        await switchToInstructorOnlyUser();

        const newApplication = {
            comments: "instructor application update permission test comment",
        };

        let resp = await apiPOST(`/instructor/applications`, newApplication);
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(`/admin/applications`, newApplication);
        expect(resp).toHaveStatus("error");

        await restoreDefaultUser();
    });

    it("fetch applications", async () => {
        await switchToInstructorOnlyUser();
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/applications`
        );
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
        resp = await apiGET(`/instructor/sessions/${session.id}/applications`);
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
