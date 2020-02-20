/**
 * @jest-environment node
 */
/* eslint-disable */
import PropTypes from "prop-types";
import { apiGET, apiPOST } from "./utils";
import { mockAPI } from "../api/mockAPI";
// eslint-disable-next-line
const { describe, it, expect } = global;

export let seededData;

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
function databaseSeedingTest(api = { apiGET, apiPOST }) {
    const { apiGET, apiPOST } = api;

    it("seed database", async () => {
        await apiPOST("/admin/debug/clear_data");

        /** Seed database with a minimal set (basic data that we need for the whole testing process) of defined
         * data including session, contract template, position, applicant and assignment.
         *
         * Assume all the POST request executed correctly, and after all data has been created, fetch all the data
         * and make sure it matches with the object we defined.
         */

        // create session
        const newSessionData = {
            start_date: new Date("2019/09/09").toISOString(),
            end_date: new Date("2019/12/31").toISOString(),
            name: "First Session",
            rate1: 56.54
        };

        const { payload: createdSession } = await apiPOST(
            "/admin/sessions",
            newSessionData
        );
        const createdSessionId = createdSession.id;

        // create contract template
        const newContractTemplateData = {
            template_name: "standard",
            template_file: "/math/default.html"
        };

        const { payload: createdContractTemplate } = await apiPOST(
            `/admin/sessions/${createdSessionId}/contract_templates`,
            newContractTemplateData
        );
        const createdContractTemplateId = createdContractTemplate.id;

        // create position
        const newPositionData = {
            contract_template_id: createdContractTemplateId,
            position_code: "MAT135F",
            position_title: "Calculus I",
            hours_per_assignment: 70,
            start_date: new Date("2019/09/09").toISOString(),
            end_date: new Date("2019/12/31").toISOString()
        };

        const { payload: createdPosition } = await apiPOST(
            `/admin/sessions/${createdSessionId}/positions`,
            newPositionData
        );
        const createdPositionId = createdPosition.id;

        // create applicant

        const newApplicantData = {
            utorid: "weasleyr",
            student_number: "89013443",
            first_name: "Ron",
            last_name: "Weasley",
            email: "ron@potter.com",
            phone: "543-223-9993"
        };

        const { payload: createdApplicant } = await apiPOST(
            `/admin/applicants`,
            newApplicantData
        );
        const createdApplicantId = createdApplicant.id;

        // create assignment
        const newAssignmentData = {
            position_id: createdPositionId,
            applicant_id: createdApplicantId,
            start_date: new Date("2019/09/09").toISOString(),
            end_date: new Date("2019/12/31").toISOString(),
            hours: 90
        };

        const { payload: createdAssignment } = await apiPOST(
            `/admin/assignments`,
            newAssignmentData
        );

        /** fetch all the data and ensure the newly created data comes back */

        // fetch session
        const { payload: withNewSession } = await apiGET("/admin/sessions");
        expect(
            withNewSession.find(x => x.id === createdSessionId)
        ).toMatchObject(newSessionData);

        // fetch contract template
        const { payload: withNewContractTemplate } = await apiGET(
            `/admin/sessions/${createdSessionId}/contract_templates`
        );
        expect(
            withNewContractTemplate.find(
                x => x.id === createdContractTemplateId
            )
        ).toMatchObject(newContractTemplateData);

        // fetch position
        const { payload: withNewPosition } = await apiGET(
            `/admin/sessions/${createdSessionId}/positions`
        );
        expect(
            withNewPosition.find(x => x.id === createdPositionId)
        ).toMatchObject(newPositionData);

        // fetch applicant

        const { payload: withNewApplicant } = await apiGET("/admin/applicants");
        expect(
            withNewApplicant.find(x => x.id === createdApplicantId)
        ).toMatchObject(newApplicantData);

        // fetch assignment
        const newAssignment = await apiGET(
            `/admin/assignments/${createdAssignment.id}`
        );
        expect(newAssignment.payload).toMatchObject(newAssignmentData);

        // update the exported global varible
        seededData = {
            createdSession,
            createdContractTemplate,
            createdPosition,
            createdApplicant,
            createdAssignment
        };
    });
}

// Run the actual tests for both the API and the Mock API
describe.skip("API tests", () => {
    describe.skip("database seeding tests", () => {
        databaseSeedingTest({ apiGET, apiPOST });
    });
});

describe("Mock API tests", () => {
    describe("database seeding tests", () => {
        databaseSeedingTest(mockAPI);
    });
});
