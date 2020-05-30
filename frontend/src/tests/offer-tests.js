import {
    it,
    expect,
    beforeAll,
} from "./utils";
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
        const resp = await apiGET(`/admin/assignments/${assignment.id}/active_offer`);
        expect(resp.payload).toEqual(null);


        // create a new offer with assignment id
        const resp1 = await apiPOST(`/admin/assignments/${assignment.id}/active_offer/create`);

        // store the response for later use
        newOffer = resp1.payload

        // general checking
        expect(resp1).toHaveStatus('success');
        expect(newOffer.id).not.toBeNull();
        expect(newOffer.status).toEqual('provisional');

        // check if the offer detail matches its assignment
        expect(newOffer.assignment_id).toEqual(assignment.id);
        expect(newOffer.hours).toEqual(assignment.hours);

        // check if the offer detail matches its applicant
        expect(newOffer.first_name).toEqual(applicant.first_name);
        expect(newOffer.last_name).toEqual(applicant.last_name);
        expect(newOffer.email).toEqual(applicant.email);

        // check if the offer detail matches its position
        expect(newOffer.position_code).toEqual(position.position_code);
        expect(newOffer.position_title).toEqual(position.position_title);
        expect(newOffer.position_start_date).toEqual(position.start_date);
        expect(newOffer.position_end_date).toEqual(position.end_date);

    });

    it("get newly created active offer for assignment", async () => {

        //get active offer
        const resp = await apiGET(`/admin/assignments/${assignment.id}/active_offer`);

        // check status
        expect(resp).toHaveStatus('success');
        // check with the data we got from creating the offer
        expect(resp.payload).toEqual(newOffer);

    });


    it("email the active offer to student", async () => {
        const resp = await apiPOST(`/assignments/${assignment.id}/active_offer/email`);

        expect(resp).toHaveStatus('success');
        expect(resp.payload).toEqual({ ...newOffer, status: 'pending' });

        newOffer = resp.payload
    });

    it('nag', async () => {

        // before nagging, make sure the status of the offer is pending
        const resp = await apiGET(`/admin/assignments/${assignment.id}/active_offer`);
        expect(resp.payload).toEqual(newOffer)

        // set the number of time of nagging
        const nagCount = 5
        // nag and check after each nagging
        for (let i = 0; i < nagCount; i++) {
            const resp = await apiPOST(`/assignments/${assignment.id}/active_offer/nag`);
            expect(resp).toHaveStatus('success');
            expect(resp.payload.nag_count).toEqual(i + 1)
        }
        // get active offer again after nagging
        const resp1 = await apiGET(`/admin/assignments/${assignment.id}/active_offer`);
        // check status
        expect(resp1).toHaveStatus('success');
        // only the value of nag_count changes with value of `nagCount`
        expect(resp1.payload).toEqual({ ...newOffer, nag_count: nagCount })

    })


    // can only create when the active offer is null or with a status of withdrawn
    // if there's an active offer is not withdrawn/provisional, can't change anything of that assignment. (assignment is locked == having active offer)
    // if assignment gets changed (withdrawn/provisional), there's no longer an active offer.
    // two routes: admin public
    // admin: accept / reject / withdraw any time 
    // public: accept / reject on status: pending, can't do no action when it is not pending
    it.todo('modify position/assignment and existing offers should not change')
    it.todo("accept/reject/withdraw offer");

    it.todo("increment nag count correctly");

    // dates, status, signature can't be changed
    // maybe we don't need this since there are limited access to offer (status, nag)
    it.todo("error when attempting to update a frozen field");
}
