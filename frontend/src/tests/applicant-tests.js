import {
    it,
    expect,
    beforeAll,
    checkPropTypes,
    applicantPropTypes,
} from "./utils";
import { databaseSeeder } from "./setup";

export function applicantTests(api) {
    const { apiGET, apiPOST } = api;
    let session;
    let applicant;
    let newApplicant;

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        session = databaseSeeder.seededData.session;
        applicant = databaseSeeder.seededData.applicant;
    }, 30000);

    it("applicants associated with a session", async () => {
        const resp = await apiGET(`/admin/sessions/${session.id}/applicants`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toContainObject(applicant);
    });

    it("add an applicant not associated with a session", async () => {
        const applicantData = {
            first_name: "Tommy",
            last_name: "Smith",
            utorid: "smith1",
        };

        const resp = await apiPOST(`/admin/applicants`, applicantData);
        expect(resp).toHaveStatus("success");
        checkPropTypes(applicantPropTypes, resp.payload);
        Object.assign(applicantData, resp.payload);

        const resp2 = await apiGET(`/admin/applicants`);
        expect(resp2).toHaveStatus("success");
        expect(resp2.payload).toContainObject(applicantData);
    });

    it("add an applicant to a session", async () => {
        newApplicant = {
            first_name: "Tommy2",
            last_name: "Smith2",
            utorid: "smith2",
        };

        const resp = await apiPOST(
            `/admin/sessions/${session.id}/applicants`,
            newApplicant
        );
        expect(resp).toHaveStatus("success");
        Object.assign(newApplicant, resp.payload);

        // When we ask for the applicants by session, the new applicant should show up
        const resp2 = await apiGET(`/admin/sessions/${session.id}/applicants`);
        expect(resp2).toHaveStatus("success");
        expect(resp2.payload).toContainObject(newApplicant);
    });

    it("updating an existing applicant via a session route will make that applicant appear in the applicant list for that session", async () => {
        // Create a new session to upsert the applicant into
        const newSession = {
            start_date: new Date("2019/09/09").toISOString(),
            end_date: new Date("2019/12/31").toISOString(),
            // add a random string to the session name so we don't accidentally collide with another
            // session's name
            name: "Newly Created Sessions 1",
            rate1: 56.54,
        };
        let resp = await apiPOST("/admin/sessions", newSession);
        expect(resp).toHaveStatus("success");
        Object.assign(newSession, resp.payload);

        // The new session shouldn't have any applicants associated with it.
        resp = await apiGET(`/admin/sessions/${newSession.id}/applicants`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload.length).toBe(0);

        // Upsert `newApplicant` to this session (`newApplicant` already exists in a different session)
        resp = await apiPOST(
            `/admin/sessions/${newSession.id}/applicants`,
            newApplicant
        );
        expect(resp).toHaveStatus("success");

        // The new session shouldn't have any applicants associated with it.
        resp = await apiGET(`/admin/sessions/${newSession.id}/applicants`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toContainObject(newApplicant);
    });

    it("associate an existing applicant with a session but reference the applicant by utorid (and not id)", async () => {
        // Create a new session to upsert the applicant into
        const newSession = {
            start_date: new Date("2019/09/09").toISOString(),
            end_date: new Date("2019/12/31").toISOString(),
            // add a random string to the session name so we don't accidentally collide with another
            // session's name
            name: "Newly Created Sessions 2",
            rate1: 59.54,
        };
        let resp = await apiPOST("/admin/sessions", newSession);
        expect(resp).toHaveStatus("success");
        Object.assign(newSession, resp.payload);

        // The new session shouldn't have any applicants associated with it.
        resp = await apiGET(`/admin/sessions/${newSession.id}/applicants`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload.length).toBe(0);

        // Upsert `newApplicant` to this session (`newApplicant` already exists in a different session)
        resp = await apiPOST(`/admin/sessions/${newSession.id}/applicants`, {
            ...newApplicant,
            id: null,
        });
        expect(resp).toHaveStatus("success");

        // The new session shouldn't have any applicants associated with it.
        resp = await apiGET(`/admin/sessions/${newSession.id}/applicants`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toContainObject(newApplicant);
    });

    it("delete an applicant with no associated assignments", async () => {
        // upsert and delete an applicant without a session
        const newApplicant1 = {
            first_name: "June",
            last_name: "Kim",
            utorid: "kim",
        };
        const resp = await apiPOST(`/admin/applicants`, newApplicant1);
        expect(resp).toHaveStatus("success");
        Object.assign(newApplicant1, resp.payload);

        // try deleting the applicant
        const resp2 = await apiPOST(`/admin/applicants/delete`, {
            id: newApplicant1.id,
        });
        expect(resp2).toHaveStatus("success");

        // verify the applicant is deleted
        const resp3 = await apiGET(`/admin/applicants`);
        expect(resp3).toHaveStatus("success");
        expect(resp3.payload.map((x) => x.id)).not.toContain(newApplicant1.id);

        // upsert and delete an applicant via session route
        const resp4 = await apiPOST(
            `/admin/sessions/${session.id}/applicants`,
            newApplicant1
        );
        expect(resp4).toHaveStatus("success");
        checkPropTypes(applicantPropTypes, resp4.payload);
        Object.assign(newApplicant1, resp4.payload);

        // try deleting the applicant
        const resp5 = await apiPOST(`/admin/applicants/delete`, {
            id: newApplicant1.id,
        });
        expect(resp5).toHaveStatus("success");

        // verify the applicant is deleted
        const resp6 = await apiGET(`/admin/sessions/${session.id}/applicants`);
        expect(resp6).toHaveStatus("success");
        expect(resp6.payload.map((x) => x.id)).not.toContain(newApplicant1.id);
    });

    it("fail to delete an applicant with an associated assignment", async () => {
        // Retrieve all assignments from the current session
        const resp0 = await apiGET(`/admin/sessions/${session.id}/assignments`);
        expect(resp0).toHaveStatus("success");

        // pick an associated applicant id
        const idToDelete = resp0.payload.filter(
            (assign) => assign.applicant_id != null
        )[0].applicant_id;

        // try deleting the applicant not via session route
        const resp1 = await apiPOST(`/admin/applicants/delete`, {
            id: idToDelete,
        });
        expect(resp1).toHaveStatus("error");

        // confirm the applicant is not deleted
        const resp2 = await apiGET(`/admin/applicants`);
        expect(resp2.payload.map((app) => app.id)).toContain(idToDelete);
    });
}
