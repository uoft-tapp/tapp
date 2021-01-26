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

    async function executeWithInstOnlyUser(action) {
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

        let respSwitchToInstOnlyUser = await apiPOST(
            `/debug/active_user`,
            newInstOnlyUser
        );
        expect(respSwitchToInstOnlyUser).toHaveStatus("success");

        await action();

        let respSwitchBackUser = await apiPOST(
            `/debug/active_user`,
            originalUser
        );
        expect(respSwitchBackUser).toHaveStatus("success");
    }

    async function cantUpdateTestFrame(
        fetchRoute,
        withSessionModRoute,
        withoutSessionModRoute,
        adminModRoute,
        modFunc
    ) {
        let respFetch = await apiGET(fetchRoute);
        expect(respFetch).toHaveStatus("success");
        const prevExistingApplicant = respFetch.payload[0];
        let updatedApplicant = { ...prevExistingApplicant };
        modFunc(updatedApplicant);

        // instructor should not have route to modify directly
        if (withSessionModRoute !== null) {
            let respInvalidRouteWithSession = await apiPOST(
                withSessionModRoute,
                updatedApplicant
            );
            expect(respInvalidRouteWithSession).toHaveStatus("error");
            checkPropTypes(errorPropTypes, respInvalidRouteWithSession);
        }

        if (withoutSessionModRoute !== null) {
            let respInvalidRouteWithoutSession = await apiPOST(
                withoutSessionModRoute,
                updatedApplicant
            );
            expect(respInvalidRouteWithoutSession).toHaveStatus("error");
            checkPropTypes(errorPropTypes, respInvalidRouteWithoutSession);
        }

        // instructor only account can not access admin mod API
        await executeWithInstOnlyUser(async () => {
            let respInvalidAccess = await apiPOST(
                adminModRoute,
                updatedApplicant
            );
            expect(respInvalidAccess).toHaveStatus("error");
            checkPropTypes(errorPropTypes, respInvalidAccess);
        });

        let respReFetchApplicant = await apiGET(fetchRoute);
        expect(respReFetchApplicant).toHaveStatus("success");
        expect(respReFetchApplicant.payload).toEqual(respFetch.payload);
    }

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

    it("can't update instructors except for self (i.e. active user)", async () => {
        let respFetchSelf = await apiGET(`/instructor/active_user`);
        expect(respFetchSelf).toHaveStatus("success");
        const self = respFetchSelf.payload;

        let respFetchInst = await apiGET(`/instructor/instructors`);
        expect(respFetchInst).toHaveStatus("success");
        let otherInst = null;
        respFetchInst.payload.forEach((inst) => {
            if (self.id !== inst.id) {
                otherInst = inst.id;
            }
        });

        if (otherInst === null) {
            throw Error("There is no other instructor other than self!");
        }

        let modifiedOtherInst = { ...otherInst };
        modifiedOtherInst.email = "test@test.com";

        // instructor should not have route to modify other instructors
        let respInvalidRouteWithSession = await apiPOST(
            `/instructor/instructors`,
            modifiedOtherInst
        );
        expect(respInvalidRouteWithSession).toHaveStatus("error");
        checkPropTypes(errorPropTypes, respInvalidRouteWithSession);

        // instructor only account can not access admin mod API
        await executeWithInstOnlyUser(async () => {
            let respInvalidAccess = await apiPOST(
                `/admin/instructors`,
                modifiedOtherInst
            );
            expect(respInvalidAccess).toHaveStatus("error");
            checkPropTypes(errorPropTypes, respInvalidAccess);
        });

        let respReFetchInst = await apiGET(`/instructor/instructors`);
        expect(respReFetchInst).toHaveStatus("success");
        expect(respReFetchInst.payload).toEqual(respFetchInst.payload);

        // TODO: instructor should be able to modify himself
        // let newSelf = { ...self };
        // newSelf.email = "test@test.net";
        // let respModSelf = await apiPOST(`/instructor/instructors`, newSelf);
        // expect(respModSelf).toHaveStatus("success");
    });

    it("fetch sessions", async () => {
        let resp = await apiGET("/instructor/instructors");
        expect(resp).toHaveStatus("success");
    });

    it("can't update session", async () => {
        await cantUpdateTestFrame(
            `/instructor/sessions`,
            null,
            `/instructor/sessions`,
            `/admin/sessions`,
            (session) => {
                session.name = "test session";
            }
        );
    });

    it("fetch positions", async () => {
        let resp = await apiGET(`/instructor/sessions/${session.id}/positions`);
        expect(resp).toHaveStatus("success");
    });

    it("can't update position", async () => {
        await cantUpdateTestFrame(
            `/instructor/sessions/${session.id}/positions`,
            `/instructor/sessions/${session.id}/positions`,
            `/instructor/positions`,
            `/admin/positions`,
            (pos) => {
                pos.position_title = "test title";
            }
        );
    });

    it("fetch contract templates", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/contract_templates`
        );
        expect(resp).toHaveStatus("success");
    });

    it("can't update contract template", async () => {
        await cantUpdateTestFrame(
            `/instructor/sessions/${session.id}/contract_templates`,
            `/instructor/sessions/${session.id}/contract_templates`,
            null,
            `/admin/sessions/${session.id}/contract_templates`,
            (template) => {
                template.template_name = "test template";
            }
        );
    });

    it("fetch applicants", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/applicants`
        );
        expect(resp).toHaveStatus("success");
    });

    it("can't update applicants", async () => {
        await cantUpdateTestFrame(
            `/instructor/sessions/${session.id}/applicants`,
            `/instructor/sessions/${session.id}/applicants`,
            `/instructor/applicants`,
            `/admin/applicants`,
            (applicant) => {
                applicant.email = "test@test.com";
            }
        );
    });

    it("fetch assignments", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/assignments`
        );
        expect(resp).toHaveStatus("success");
    });

    it("can't update applications", async () => {
        await cantUpdateTestFrame(
            `/instructor/sessions/${session.id}/applications`,
            null,
            `/instructor/applications`,
            `/admin/applications`,
            (application) => {
                application.program = "test program";
            }
        );
    });

    it("fetch applications", async () => {
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/applications`
        );
        expect(resp).toHaveStatus("success");
    });
}
