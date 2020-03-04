/**
 * @jest-environment node
 */
/* eslint-disable */
import PropTypes from "prop-types";
import {
    apiGET,
    apiPOST,
    addSession,
    deleteSession,
    addPosition,
    deletePosition,
    checkPropTypes,
    offerTemplateMinimalPropTypes,
    offerTemplatePropTypes,
    positionPropTypes,
    instructorPropTypes,
    errorPropTypes,
    expect,
    describe,
    it,
    beforeAll,
    afterAll
} from "./utils";
import { mockAPI } from "../api/mockAPI";
import { databaseSeeder } from "./setup";
import { sessionsTests } from "./session-tests";
import { templatesTests } from "./template-tests";

function positionsTests(api = { apiGET, apiPOST }) {
    const { apiGET, apiPOST } = api;
    let session = null,
        position = null,
        contractTemplate = null;
    const newPositionData = {
        position_code: "MAT135F",
        position_title: "Calculus I",
        hours_per_assignment: 70,
        start_date: "2018/05/09",
        end_date: "2018/09/09"
    };
    // set up a session to be available before tests run
    beforeAll(async () => {
        // this session will be available for all tests
        session = await addSession({ apiGET, apiPOST });
        const resp = await apiGET(`/sessions/${session.id}/contract_templates`);
        contractTemplate = resp.payload[0] || {};
        newPositionData.contract_template_id = contractTemplate.id;
    });
    // delete the session after the tests run
    afterAll(async () => {
        await deleteSession({ apiGET, apiPOST }, session);
    });

    it("create a position", async () => {
        const resp1 = await apiPOST(
            `/sessions/${session.id}/positions`,
            newPositionData
        );
        expect(resp1).toMatchObject({ status: "success" });
        // make sure we got back what we put in
        expect(resp1.payload).toMatchObject(newPositionData);

        // save this position for use in later tests
        position = resp1.payload;
    });

    it("get positions for session", async () => {
        const resp1 = await apiGET(`/sessions/${session.id}/positions`);
        expect(resp1).toMatchObject({ status: "success" });
        checkPropTypes(PropTypes.arrayOf(positionPropTypes), resp1.payload);

        // make sure the position we created is in that list
        expect(resp1.payload).toContainObject(newPositionData);
    });

    it("update a position", async () => {
        const id = position.id;
        const newData = { id, hours_per_assignment: 75 };
        const resp1 = await apiPOST(`/positions`, newData);
        expect(resp1).toMatchObject({ status: "success" });
        expect(resp1.payload).toMatchObject(newData);

        // get the positions list and make sure we're updated there as well
        const resp2 = await apiGET(`/sessions/${session.id}/positions`);
        expect(resp2.payload).toContainObject(newData);
    });

    it.todo("error when updating a position to have an empty position_code");

    it.todo("error when creating a position for a session with an invalid id");

    it("error when creating two positions with the same position_code in the same session", async () => {
        // we already have a position
        const resp1 = await apiPOST(
            `/sessions/${session.id}/positions`,
            newPositionData
        );
        expect(resp1).toMatchObject({ status: "error" });
        checkPropTypes(errorPropTypes, resp1);
    });

    it("error when creating a positions with blank position_code", async () => {
        // we already have a position
        const resp1 = await apiPOST(`/sessions/${session.id}/positions`, {
            ...newPositionData,
            position_code: ""
        });
        checkPropTypes(errorPropTypes, resp1);
    });

    it("succeed when creating two positions with the same code but for different sessions", async () => {
        const newSessionData = {
            start_date: "2019/09/09",
            end_date: "2019/12/31",
            // add a random string to the session name so we don't accidentally collide with another
            // session's name
            name: "Newly Created Sessions (" + Math.random() + ")",
            rate1: 56.54
        };
        const newPositionData2 = {
            position_code: "MAT135F",
            position_title: "Calculus I",
            hours_per_assignment: 70,
            start_date: "2019/09/09",
            end_date: "2019/12/31",
            contract_template_id: contractTemplate.id
        };
        // create a new session to add a template to
        const resp1 = await apiPOST("/sessions", newSessionData);
        expect(resp1).toMatchObject({ status: "success" });
        const sessionId = resp1.payload.id;

        // create a new position of the same code associated with new session
        const resp2 = await apiPOST(
            `/sessions/${sessionId}/positions`,
            newPositionData2
        );
        expect(resp2).toMatchObject({ status: "success" });
        // make sure we get back what we put in
        expect(resp2.payload).toMatchObject(newPositionData2);

        // make sure the position is created
        const resp3 = await apiGET(`/sessions/${sessionId}/positions`);
        expect(resp3.payload).toContainObject(resp2.payload);
    });

    it("delete position", async () => {
        const resp1 = await apiPOST(`/positions/delete`, position);
        expect(resp1).toMatchObject({ status: "success" });

        const resp2 = await apiGET(`/sessions/${session.id}/positions`);
        expect(resp2.payload).not.toContainObject(position);
    });

    it.todo(
        "create a position with instructors list specified and have instructors automatically added to the position"
    );
}

function instructorsTests({ apiGET, apiPOST }) {
    let session = null,
        position = null,
        instructor = null;
    // set up a session to be available before tests run
    beforeAll(async () => {
        // this session will be available for all tests
        session = await addSession({ apiGET, apiPOST });
        position = await addPosition({ apiGET, apiPOST }, session);
    });
    // delete the session after the tests run
    afterAll(async () => {
        await deletePosition({ apiGET, apiPOST }, position);
        await deleteSession({ apiGET, apiPOST }, session);
    });

    it("create instructor", async () => {
        const newInstructorData = {
            first_name: "Anand",
            last_name: "Liu",
            email: "anand.liu.sample@utoronto.ca",
            utorid: "anandl"
        };

        // create a new instructor
        const resp1 = await apiPOST(`/instructors`, newInstructorData);
        expect(resp1).toMatchObject({ status: "success" });
        expect(resp1.payload).toMatchObject(newInstructorData);

        // make sure instructor is on instructor list
        const resp2 = await apiGET(`/instructors`);
        expect(resp2).toMatchObject({ status: "success" });
        expect(resp2.payload).toContainObject(newInstructorData);

        // set instructor to used by later test
        instructor = resp1.payload;
    });

    it("get instructors", async () => {
        const resp = await apiGET("/instructors");
        expect(resp).toMatchObject({ status: "success" });
        checkPropTypes(PropTypes.arrayOf(instructorPropTypes), resp.payload);
    });

    it("update an instructor", async () => {
        const updateInstructorData = {
            id: instructor.id,
            email: "anand.liu@gmail.com"
        };

        // update the instructor
        const resp = await apiPOST(`/instructors`, updateInstructorData);
        expect(resp).toMatchObject({ status: "success" });
        expect(resp.payload).toMatchObject(updateInstructorData);
    });

    // delete an instructor
    it("delete instructor", async () => {
        const resp1 = await apiPOST(`/instructors/delete`, instructor);
        expect(resp1).toMatchObject({
            status: "success",
            payload: { id: instructor.id }
        });

        // make sure the instructor is deleted
        const resp2 = await apiGET("/instructors");
        expect(resp2).toMatchObject({ status: "success" });
        checkPropTypes(PropTypes.arrayOf(instructorPropTypes), resp2.payload);
        expect(resp2).not.toContainObject(instructor);
    });

    it.todo("fail to delete instructor from a position with invalid id");
}
function assignmentsTests({ apiGET, apiPOST }) {
    it.todo("get assignments for session");
    it.todo("get assignments for position");
    it.todo("create and delete assignment for position");
    it.todo("update assignment dates/note/offer_override_pdf");
}
function wageChunksTests({ apiGET, apiPOST }) {
    it.todo("get wage_chunks for position");
    it.todo("create and delete wage_chunk for position");
    it.todo("update wage_chunk");
    it.todo(
        "automatic creation of wage chunk for position when `hours` is set"
    );
}
function offersTests({ apiGET, apiPOST }) {
    // maybe we don't need this in the API?
    it.todo("get offers for session");
    // maybe we don't need this in the API?
    it.todo("get offers for position");
    it.todo("get offer for assignment");
    it.todo("accept/reject/withdraw offer");
    it.todo("increment nag count");
    it.todo("error when attempting to update a frozen field");
}
function reportingTagsTests({ apiGET, apiPOST }) {
    it.todo("get reporting_tags for session");
    it.todo("get reporting_tags for position");
    it.todo("get reporting_tags for wage_chunk");
    it.todo("create and delete reporting_tags for position");
    it.todo("create and delete reporting_tags for wage_chunk");
}
function applicationsTests({ apiGET, apiPOST }) {}

function unknownRouteTests(api = { apiGet, apiPost }) {
    const { apiGet, apiPost } = api;

    it("should fail GET request with unknown '/api' routes", async () => {
        const resp = await apiGET("/some_string");
        expect(resp).toMatchObject({ status: "error" });
    });
}

// Run the actual tests for both the API and the Mock API
describe("API tests", () => {
    const api = { apiGET, apiPOST };

    it("Seed the database", async () => {
        await databaseSeeder.seed(api);
        await databaseSeeder.verifySeed(api);
    }, 30000);

    describe("`/sessions` tests", () => {
        sessionsTests(api);
    });

    describe("template tests", () => {
        templatesTests(api);
    });
    //     // // XXX position_template was renamed contract_template. The backend needs to be fixed,
    //     // // but it is being rewritten, so skip the test for now
    //     // describe.skip("`/positions` tests", () => {
    //     //     positionsTests({ apiGET, apiPOST });
    //     // });
    //     // describe.skip("`/instructors` tests", () => {
    //     //     instructorsTests({ apiGET, apiPOST });
    //     // });
    //     // describe.skip("`/assignments` tests", () => {
    //     //     assignmentsTests({ apiGET, apiPOST });
    //     // });
    //     // describe.skip("wage_chunk tests", () => {
    //     //     wageChunksTests({ apiGET, apiPOST });
    //     // });
    //     // describe.skip("offers tests", () => {
    //     //     offersTests({ apiGET, apiPOST });
    //     // });
    //     // describe.skip("reporting_tag tests", () => {
    //     //     reportingTagsTests({ apiGET, apiPOST });
    //     // });
    //     // describe.skip("`/applications` tests", () => {
    //     //     applicationsTests({ apiGET, apiPOST });
    //     // });
    //     // describe.skip("unknown api route tests", () => {
    //     //     unknownRouteTests({ apiGET, apiPOST });
    //     // });
});

describe("Mock API tests", () => {
    it("Seed the database", async () => {
        await databaseSeeder.seed(mockAPI);
        await databaseSeeder.verifySeed(mockAPI);
    });
    describe("`/sessions` tests", () => {
        sessionsTests(mockAPI);
    });
    describe("template tests", () => {
        templatesTests(mockAPI);
    });
    // describe("`/positions` tests", () => {
    //     positionsTests(mockAPI);
    // });
    // describe("`/instructors` tests", () => {
    //     instructorsTests(mockAPI);
    // });
});
