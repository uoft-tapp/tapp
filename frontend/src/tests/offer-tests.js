import PropTypes from "prop-types";
import {
    it,
    expect,
    beforeAll,
    checkPropTypes,
    assignmentPropTypes
} from "./utils";
import { databaseSeeder } from "./setup";

// TODO: Remove eslint disable
// eslint-disable-next-line
export function offersTests(api) {
    const { apiGET, apiPOST } = api;
    let session;
    let applicant;
    let assignment;
    let contractTemplate;
    beforeAll(async () => {
        await databaseSeeder.seed(api);
        assignment = databaseSeeder.seededData.assignment;
    }, 30000);

    // can only create when the active offer is null or with a status of withdrawn
    it("create an active offer", async () => {

        // checking not active offer before create
        const resp = await apiGET(`/admin/assignments/${assignment.id}/active_offer`);
        expect(resp.payload).toEqual(null);
        // create a new offer with assignment id
        const { payload: newOffer, status } = await apiPOST(`/admin/assignments/${assignment.id}/active_offer/create`);
        // checked the respond
        expect(status).toEqual('success');
        expect(newOffer.id).not.toBeNull();
        expect(newOffer.active_offer_status).toEqual('provisional');

    });

    it("get newly created active offer for assignment", async () => {

        // checking not active offer before create
        const { payload: activeOffer, status } = await apiGET(`/admin/assignments/${assignment.id}/active_offer`);
        expect(status).toEqual('success');
        expect(activeOffer.id).not.toBeNull();
        expect(activeOffer.status).toEqual('provisional');

    });

    // if there's an active offer is not withdrawn/provisional, can't change anything of that assignment. (assignment is locked == having active offer)
    // if assignment gets changed (withdrawn/provisional), there's no longer an active offer.




    // two routes: admin public
    // admin: accept / reject / withdraw any time 
    // public: accept / reject on status: pending, can't do no action when it is not pending

    it.todo("accept/reject/withdraw offer");

    it.todo("increment nag count correctly");

    // dates, status, signature can't be changed
    // maybe we don't need this since there are limited access to offer (status, nag)
    it.todo("error when attempting to update a frozen field");
}
