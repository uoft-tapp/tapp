import { it, expect, beforeAll } from "./utils";
import { databaseSeeder } from "./setup";
import axios from "axios";

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

    it("when an offer is emailed a second time, the emailed date is updated to the most recent emailed date", async () => {
        // record previous emailed_date
        const resp = await apiGET(
            `/admin/assignments/${assignment.id}/active_offer`
        );
        expect(resp).toHaveStatus("success");
        const previousDate = resp.payload.emailed_date;

        // Wait just a little bit to ensure some time has elapsed
        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        // send the email again
        const resp1 = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/email`
        );
        expect(resp1).toHaveStatus("success");
        // update newOffer
        newOffer = resp1.payload;
        // check if date is updated
        const newDate = resp1.payload.emailed_date;
        expect(Date.parse(newDate)).toBeGreaterThan(Date.parse(previousDate));

        // check if date is updated correctly
        const resp2 = await apiGET(
            `/admin/assignments/${assignment.id}/active_offer`
        );
        expect(resp2).toHaveStatus("success");
        const updatedDate = resp2.payload.emailed_date;
        expect(updatedDate).toEqual(newDate);
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

    it("Fetch all past offers pertaining to an assignment", async () => {
        // Withdraw then re-create any existing offers in
        // case they have previously been rejected
        let resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/withdraw`
        );
        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/create`
        );
        expect(resp).toHaveStatus("success");

        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/email`
        );
        expect(resp).toHaveStatus("success");
        let first_date = resp.payload.emailed_date;

        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/withdraw`
        );
        expect(resp).toHaveStatus("success");

        resp = await apiPOST(`/admin/assignments`, assignment);
        expect(resp).toHaveStatus("success");

        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/create`
        );
        expect(resp).toHaveStatus("success");

        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/email`
        );
        expect(resp).toHaveStatus("success");
        let second_date = resp.payload.emailed_date;

        resp = await apiGET(
            `/admin/assignments/${assignment.id}/active_offer/history`
        );
        expect(resp).toHaveStatus("success");
        expect(resp.payload[1].emailed_date).toMatch(first_date);
        expect(resp.payload[0].emailed_date).toMatch(second_date);
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

/**
 * Email tests actually send emails and expect `mailcatcher` to catch
 * the sent emails. These tests cannot be run with the mock API.
 *
 * @export
 * @param {*} api
 */
export function offerEmailTests(api) {
    const { apiPOST } = api;
    const MAILCATCHER_BASE_URL = "http://mailcatcher:1080";

    let applicant;
    let assignment;
    let position;
    let newOffer;

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        assignment = databaseSeeder.seededData.assignment;
        applicant = databaseSeeder.seededData.applicant;
        position = databaseSeeder.seededData.position;
    }, 30000);

    it("can fetch messages from mailcatcher", async () => {
        let resp = await axios.get(`${MAILCATCHER_BASE_URL}/messages`);
        expect(resp.data.length >= 0).toEqual(true);
        // Clear all the messages from mailcatcher
        await axios.delete(`${MAILCATCHER_BASE_URL}/messages`);
        resp = await axios.get(`${MAILCATCHER_BASE_URL}/messages`);
        expect(resp.data.length).toEqual(0);
    });

    it("email makes a round trip", async () => {
        const beforeEmails = (
            await axios.get(`${MAILCATCHER_BASE_URL}/messages`)
        ).data;

        let resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/create`
        );
        expect(resp).toHaveStatus("success");
        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/email`
        );
        expect(resp).toHaveStatus("success");
        newOffer = resp.payload;

        // Wait for mailcatcher to get the email and then search for it.
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const afterEmails = (
            await axios.get(`${MAILCATCHER_BASE_URL}/messages`)
        ).data;

        expect(afterEmails.length).toBeGreaterThan(beforeEmails.length);
        // Assume the email we just sent is at the end of the list
        const newEmail = afterEmails[afterEmails.length - 1];

        // The subject should contain the position code
        expect(newEmail.subject).toMatch(new RegExp(position.position_code));

        // The body should contain the position code as well as a link to the contract.
        // We check this by looking for the URL token.
        const emailBody = (
            await axios.get(
                `${MAILCATCHER_BASE_URL}/messages/${newEmail.id}.source`
            )
        ).data;
        expect(emailBody).toMatch(new RegExp(position.position_code));
        expect(emailBody).toMatch(new RegExp(newOffer.url_token));
    });

    it("nag email makes a round trip", async () => {
        const beforeEmails = (
            await axios.get(`${MAILCATCHER_BASE_URL}/messages`)
        ).data;

        let resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/nag`
        );
        expect(resp).toHaveStatus("success");
        newOffer = resp.payload;

        // Wait for mailcatcher to get the email and then search for it.
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const afterEmails = (
            await axios.get(`${MAILCATCHER_BASE_URL}/messages`)
        ).data;

        expect(afterEmails.length).toBeGreaterThan(beforeEmails.length);
        // Assume the email we just sent is at the end of the list
        const newEmail = afterEmails[afterEmails.length - 1];

        // The subject should contain the position code
        expect(newEmail.subject).toMatch(new RegExp(position.position_code));
        expect(newEmail.subject).toMatch(/Reminder/i);

        // The body should contain the position code as well as a link to the contract.
        // We check this by looking for the URL token.
        const emailBody = (
            await axios.get(
                `${MAILCATCHER_BASE_URL}/messages/${newEmail.id}.source`
            )
        ).data;
        expect(emailBody).toMatch(new RegExp(position.position_code));
        expect(emailBody).toMatch(new RegExp(newOffer.url_token));
    });

    it("if applicants email is changed, offer is sent to the new email", async () => {
        const beforeEmails = (
            await axios.get(`${MAILCATCHER_BASE_URL}/messages`)
        ).data;

        let resp = await apiPOST(`/admin/applicants`, {
            ...applicant,
            email: "goofy-duck@donald.com",
        });
        expect(resp).toHaveStatus("success");
        Object.assign(applicant, resp.payload);

        resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/email`
        );
        expect(resp).toHaveStatus("success");
        newOffer = resp.payload;

        // Wait for mailcatcher to get the email and then search for it.
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const afterEmails = (
            await axios.get(`${MAILCATCHER_BASE_URL}/messages`)
        ).data;

        expect(afterEmails.length).toBeGreaterThan(beforeEmails.length);
        // Assume the email we just sent is at the end of the list
        const newEmail = afterEmails[afterEmails.length - 1];

        // The subject should contain the position code
        expect(newEmail.recipients[0]).toMatch(new RegExp(applicant.email));
    });
}

/**
 * Tests for downloading pdfs/html versions of an offer. These can only be run
 * with the real API.
 *
 * @export
 * @param {*} api
 */
export function offerDownloadTests(api) {
    const { apiPOST } = api;
    const BACKEND_BASE_URL = "http://backend:3000";

    let applicant;
    let assignment;
    let position;
    let newOffer;

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        assignment = databaseSeeder.seededData.assignment;
        applicant = databaseSeeder.seededData.applicant;
        position = databaseSeeder.seededData.position;
    }, 30000);

    it("can download html and pdf versions of an offer", async () => {
        let resp = await apiPOST(
            `/admin/assignments/${assignment.id}/active_offer/create`
        );
        expect(resp).toHaveStatus("success");
        newOffer = resp.payload;

        const offerHtml = (
            await axios.get(
                `${BACKEND_BASE_URL}/public/contracts/${newOffer.url_token}`
            )
        ).data;

        expect(offerHtml).toMatch(new RegExp(applicant.first_name));
        expect(offerHtml).toMatch(new RegExp(applicant.last_name));
        expect(offerHtml).toMatch(new RegExp(position.position_code));
        expect(offerHtml).toMatch(new RegExp("" + newOffer.hours));

        // Get the PDF version
        const offerPdf = (
            await axios.get(
                `${BACKEND_BASE_URL}/public/contracts/${newOffer.url_token}.pdf`
            )
        ).data;
        // All PDF files start with the text "%PDF"
        expect(offerPdf.slice(0, 4)).toEqual("%PDF");
    });
}
