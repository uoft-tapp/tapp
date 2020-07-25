import { it, expect, beforeAll } from "./utils";
import { databaseSeeder } from "./setup";

// TODO: Remove eslint disable
// eslint-disable-next-line
export function offersTests(api) {
    const { apiGET, apiPOST } = api;

    let applicant;
    let assignment;
    let position;
    let newOffer;
    let newOffer2 = {};

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        assignment = databaseSeeder.seededData.assignment;
        applicant = databaseSeeder.seededData.applicant;
        position = databaseSeeder.seededData.position;
    }, 30000);

    it("create an active offer", async () => {
        // checking not active offer before create
        const resp = await apiGET(
            `/admin/assignments/${assignment.id}/active_offer`
        );
        expect(resp.payload).toBeNull();

        // create a new offer with assignment id
        const resp1 = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/create`
        );
        expect(resp1).toHaveStatus("success");
        // store the response for later use
        newOffer = resp1.payload;

        expect(newOffer.id).not.toBeNull();
        expect(newOffer).toMatchObject({
            status: "provisional",
            assignment_id: assignment.id,
            hours: assignment.hours,
            first_name: applicant.first_name,
            last_name: applicant.last_name,
            email: applicant.email,
            position_code: position.position_code,
            position_title: position.position_title,
            position_start_date: position.start_date,
            position_end_date: position.end_date,
        });
    });

    it("get newly created active offer for assignment", async () => {
        //get active offer
        const resp = await apiGET(
            `/admin/assignments/${assignment.id}/active_offer`
        );

        // check status
        expect(resp).toHaveStatus("success");
        // check with the data we got from creating the offer
        expect(resp.payload).toEqual(newOffer);
    });

    it("email the active offer to student", async () => {
        const resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/email`
        );
        expect(resp).toHaveStatus("success");

        newOffer = resp.payload;
        // Offers that have been emailed switch from `status: "provisional"` to `status: "pending"`
        expect(newOffer).toMatchObject({
            status: "pending",
        });
        expect(newOffer.emailed_date).not.toBeNull();
    });

    it("increment nag count correctly", async () => {
        // before nagging, make sure the status of the offer is pending
        const resp = await apiGET(
            `/admin/assignments/${assignment.id}/active_offer`
        );
        expect(resp.payload).toEqual(newOffer);

        // set the number of time of nagging
        const nagCount = 3;
        // nag and check after each nagging
        for (let i = 0; i < nagCount; i++) {
            const resp = await apiPOST(
                `/admin/assignments/${assignment.id}/active_offer/nag`
            );
            expect(resp).toHaveStatus("success");
            expect(resp.payload.nag_count).toEqual(i + 1);
        }
        // get active offer again after nagging
        const resp1 = await apiGET(
            `/admin/assignments/${assignment.id}/active_offer`
        );
        // check status
        expect(resp1).toHaveStatus("success");
        // only the value of nag_count changes with value of `nagCount`
        expect(resp1.payload).toEqual({ ...newOffer, nag_count: nagCount });
    });

    // See https://github.com/uoft-tapp/tapp/wiki/Workflow-Diagram-for-offers for detailed
    // diagram of the offer create/withdraw/email/etc. logic
    it("accept/reject/withdraw offer", async () => {
        let resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/accept`
        );
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({ status: "accepted" });
        // The assignment's active offer status should match
        resp = await apiGET(`/admin/assignments/${assignment.id}`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({ active_offer_status: "accepted" });

        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/reject`
        );
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({ status: "rejected" });
        // The assignment's active offer status should match
        resp = await apiGET(`/admin/assignments/${assignment.id}`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({ active_offer_status: "rejected" });

        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/withdraw`
        );
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({ status: "withdrawn" });
        // The assignment's active offer status should match
        resp = await apiGET(`/admin/assignments/${assignment.id}`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({
            active_offer_status: "withdrawn",
        });

        // Make sure we can set the offer back to `"accepted"` from a withdrawn state.
        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/accept`
        );
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({ status: "accepted" });
        Object.assign(newOffer, resp.payload);
    });

    it("error when attempting to create an offer for an assignment that has an active offer that is accepted/rejected", async () => {
        // Since `newOffer.status` is `"accepted"`, this should fail
        let resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/create`
        );
        expect(resp).toHaveStatus("error");

        // Rejected offers also cannot be created anew
        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/reject`
        );
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({ status: "rejected" });
        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/create`
        );
        expect(resp).toHaveStatus("error");
    });

    it("create an offer for an assignment whose active offer is withdrawn", async () => {
        // Withdraw the offer first
        let resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/withdraw`
        );
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({ status: "withdrawn" });
        Object.assign(newOffer, resp.payload);

        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/create`
        );
        expect(resp).toHaveStatus("success");
        expect(resp.payload.id).not.toBeNull();
        expect(resp.payload.id).not.toEqual(newOffer.id);
        Object.assign(newOffer2, resp.payload);
    });

    it("fails to create new offer when active_offer is provisional/pending", async () => {
        // newOffer2 should be a "provisional" offer. We need that to run this test
        expect(newOffer2).toMatchObject({ status: "provisional" });

        // Fail to create a new offer again
        let resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/create`
        );
        expect(resp).toHaveStatus("error");

        // Email the offer and try to create again; this should fail
        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/email`
        );
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({ status: "pending" });
        Object.assign(newOffer2, resp.payload);
        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/create`
        );
        expect(resp).toHaveStatus("error");
    });

    it("cannot change assignment if there is an active offer that isn't withdrawn/pending", async () => {
        // This tests starts off assuming `newOffer2` is pending
        expect(newOffer2).toMatchObject({ status: "pending" });

        // Error when updating the offer
        let resp = await apiPOST(`/admin/assignments`, {
            ...assignment,
            hours: 98.6,
        });
        expect(resp).toHaveStatus("error");
        resp = await apiGET(`/admin/assignments/${assignment.id}`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload.hours).not.toEqual(98.6);

        // Accept the offer and try again.
        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/accept`
        );
        expect(resp).toHaveStatus("success");
        resp = await apiPOST(`/admin/assignments`, {
            ...assignment,
            hours: 98.6,
        });
        expect(resp).toHaveStatus("error");
        resp = await apiGET(`/admin/assignments/${assignment.id}`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload.hours).not.toEqual(98.6);

        // Reject the offer and try again.
        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/reject`
        );
        expect(resp).toHaveStatus("success");
        resp = await apiPOST(`/admin/assignments`, {
            ...assignment,
            hours: 98.6,
        });
        expect(resp).toHaveStatus("error");
        resp = await apiGET(`/admin/assignments/${assignment.id}`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload.hours).not.toEqual(98.6);
    });

    it("changing an assignment with a withdrawn/pending active offer should succeed and remove the offer", async () => {
        // Withdraw the current offer
        let resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/withdraw`
        );
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({ status: "withdrawn" });
        resp = await apiGET(`/admin/assignments/${assignment.id}`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({
            active_offer_status: "withdrawn",
        });
        const assignmentWithWithdrawnOffer = resp.payload;

        // We should now be able to change the assignment
        resp = await apiPOST(`/admin/assignments`, {
            ...assignment,
            hours: 98.6,
        });
        expect(resp).toHaveStatus("success");
        expect(resp.payload.id).toEqual(assignmentWithWithdrawnOffer.id);
        expect(resp.payload.hours).toEqual(98.6);
        expect(resp.payload.active_offer_status).toBeNull();
        expect(resp.payload.active_offer_status).toBeNull();
        expect(resp.payload.active_offer_url_token).toBeNull();

        // The same should work for a provisional offer
        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/create`
        );
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({ status: "provisional" });
        resp = await apiGET(`/admin/assignments/${assignment.id}`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject({
            active_offer_status: "provisional",
        });
        const assignmentWithProvisionalOffer = resp.payload;

        // We should now be able to change the assignment
        resp = await apiPOST(`/admin/assignments`, {
            ...assignment,
            hours: 99.6,
        });
        expect(resp).toHaveStatus("success");
        expect(resp.payload.id).toEqual(assignmentWithProvisionalOffer.id);
        expect(resp.payload.hours).toEqual(99.6);
        expect(resp.payload.active_offer_status).toBeNull();
        expect(resp.payload.active_offer_status).toBeNull();
        expect(resp.payload.active_offer_url_token).toBeNull();
    });
}
