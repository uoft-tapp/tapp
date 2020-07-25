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

    // can only create when the active offer is null or with a status of withdrawn
    // if there's an active offer is not withdrawn/provisional, can't change anything of that assignment. (assignment is locked == having active offer)
    // if assignment gets changed (withdrawn/provisional), there's no longer an active offer.
    // two routes: admin public
    // admin: accept / reject / withdraw any time
    // public: accept / reject on status: pending, can't do no action when it is not pending
    it.todo("modify position/assignment and existing offers should not change");
    it.todo("accept/reject/withdraw offer");

    it.todo(
        "error when attempting to create an offer for an assignment that has an active offer that is accepted/rejected/pending"
    );
    it.todo(
        "create an offer for an assignment that has an active offer that is withdrawn/preliminary"
    );
}
