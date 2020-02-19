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
    sessionPropTypes,
    offerTemplateMinimalPropTypes,
    offerTemplatePropTypes,
    positionPropTypes,
    instructorPropTypes,
    errorPropTypes
} from "./utils";
import { mockAPI } from "../api/mockAPI";
// eslint-disable-next-line
const { describe, it, expect, beforeAll, afterAll } = global;

// add a custom `.toContainObject` method to `expect()` to see if an array contains
// an object with matching props. Taken from
// https://medium.com/@andrei.pfeiffer/jest-matching-objects-in-array-50fe2f4d6b98
expect.extend({
    toContainObject(received, argument) {
        const pass = this.equals(
            received,
            expect.arrayContaining([expect.objectContaining(argument)])
        );

        if (pass) {
            return {
                message: () =>
                    `expected ${this.utils.printReceived(
                        received
                    )} not to contain object ${this.utils.printExpected(
                        argument
                    )}`,
                pass: true
            };
        } else {
            return {
                message: () =>
                    `expected ${this.utils.printReceived(
                        received
                    )} to contain object ${this.utils.printExpected(argument)}`,
                pass: false
            };
        }
    }
});

/**
 * Seeding the database with the minimal set of API calls to create an assignment.
 */
function dataBaseSeed(api = { apiGET, apiPOST }) {
    const { apiGET, apiPOST } = api;
    let session = null;

    const minimalSessionData = {
        start_date: new Date("2020/02/10").toISOString(),
        end_date: new Date("2020/12/31").toISOString(),
        name: "Minimal Session Data",
        rate1: 50
    };

    const minimalPositionData = {
        session_id: 1,
        position_code: "CSC494",
        position_title: "Capstone Project",
        hours_per_assignment: 20,
        start_date: "2020/01/01",
        end_date: "2020/05/01"
    };

    const minimalApplicantData = {
        utorid: "cole",
        student_number: "10000000",
        first_name: "Cole",
        last_name: "Zemel",
        email: "cole.zemel@gmail.com",
        phone: "4166666666"
    };

    const minimalAssignmentData = {
        position_id: 1,
        applicant_id: 1,
        start_date: "2020/01/01",
        end_date: "2020/05/01",
        note: "N/A",
        offer_override_pdf: "N/A",
        active_offer_status: 1,
        active_offer_id: 12345678
    };

    beforeAll(async () => {
        await apiPOST("/admin/debug/snapshot");
        await apiPOST("/admin/debug/clear_data");
    }, 15000);

    //Create Session
    it("create a session", async () => {
        const resp1 = await apiPOST("/admin/sessions", minimalSessionData);
        // const { payload: minimalSession } = await apiGET("/admin/sessions");
        console.log("minimal session: \n", resp1);
    });

    //Create Position
    it("create a position", async () => {
        const resp1 = await apiPOST(
            `/sessions/${minimalPositionData.session_id}/positions`,
            minimalPositionData
        );
        const { payload: minimalPosition } = await apiGET(
            `/sessions/${minimalPositionData.session_id}/positions`
        );
        console.log("minimal position: \n", minimalPosition);
    });

    //Create Applicant
    it("create an applicant", async () => {
        const resp1 = await apiPOST(`/admin/applicants`, minimalApplicantData);
        const { payload: minimalApplicant } = await apiGET(`/applicants`);
        console.log("minimal applicant: \n", minimalApplicant);
    });

    //Create Assignment
    it("create an assignment", async () => {
        const resp1 = await apiPOST(
            `/admin/assignments`,
            minimalAssignmentData
        );
        const { payload: minimalAssignment } = await apiGET(
            `/assignments/${minimalAssignmentData.id}`
        );
        console.log(minimalAssignmentData);
        console.log("minimal assignment: \n", minimalAssignment);
    });
}

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
function sessionsTests(api = { apiGET, apiPOST }) {
    const { apiGET, apiPOST } = api;
    let session = null;

    beforeAll(async () => {
        await apiPOST("/admin/debug/snapshot");
        await apiPOST("/admin/debug/clear_data");
    }, 15000);
    afterAll(async () => {
        await apiPOST("/admin/debug/restore_snapshot");
    });

    const newSessionData = {
        start_date: new Date("2019/09/09").toISOString(),
        end_date: new Date("2019/12/31").toISOString(),
        // add a random string to the session name so we don't accidentally collide with another
        // session's name
        name: "Newly Created Sessions (" + Math.random() + ")",
        rate1: 56.54
    };

    it("create a session", async () => {
        // get all the sessions so that we can check that our newly inserted session has
        // a unique id.
        const { payload: initialSessions } = await apiGET("/admin/sessions");
        // do we get a success response when creating the session?
        const resp1 = await apiPOST("/admin/sessions", newSessionData);
        expect(resp1).toMatchObject({ status: "success" });
        const { payload: createdSession } = resp1;
        // make sure the propTypes are right
        checkPropTypes(sessionPropTypes, createdSession);
        // make sure the data we get back is the same we put in
        expect(createdSession).toMatchObject(newSessionData);
        // make sure we have an id
        expect(createdSession.id).not.toBeNull();
        // make sure the id is unique and wasn't already a session id
        expect(initialSessions.map(x => x.id)).not.toContain(createdSession.id);

        // fetch all sessions and make sure we're in there
        const { payload: withNewSessions } = await apiGET("/admin/sessions");
        expect(withNewSessions.length).toBeGreaterThan(initialSessions.length);
        // make sure the id of our new session came back
        expect(withNewSessions.map(x => x.id)).toContain(createdSession.id);

        // save this session for use in later tests
        session = resp1.payload;
    });

    it("fetch sessions", async () => {
        const resp = await apiGET("/admin/sessions");

        expect(resp).toMatchObject({ status: "success" });
        checkPropTypes(PropTypes.arrayOf(sessionPropTypes), resp.payload);
    });

    it("update a session", async () => {
        const newData = { ...session, rate1: 57.75 };
        const resp1 = await apiPOST("/admin/sessions", newData);
        expect(resp1).toMatchObject({ status: "success" });
        expect(resp1.payload).toMatchObject(newData);

        // get the sessions list and make sure we're updated there as well
        const resp2 = await apiGET("/admin/sessions");
        // filter session list to get the updated session obj
        const updatedSession = resp2.payload.filter(s => s.id == session.id);
        expect(updatedSession).toContainObject(newData);
    });

    it("throw error when `name` is empty", async () => {
        // create new session with empty name
        const newData1 = { ...newSessionData, name: "" };
        const newData2 = { ...newSessionData, name: undefined };

        const resp1 = await apiPOST("/admin/sessions", newData1);
        expect(resp1).toMatchObject({ status: "error" });
        checkPropTypes(errorPropTypes, resp1);

        const resp2 = await apiPOST("/admin/sessions", newData2);
        expect(resp2).toMatchObject({ status: "error" });
        checkPropTypes(errorPropTypes, resp2);
    });

    it("throw error when `name` is not unique", async () => {
        // name identical to the exisiting session
        const newData = { ...newSessionData, name: session.name };
        // POST to create new session
        const resp1 = await apiPOST("/admin/sessions", newData);

        // expected an error as name not unique
        expect(resp1).toMatchObject({ status: "error" });
        checkPropTypes(errorPropTypes, resp1);
    });

    it("throw error when deleting item with invalid id", async () => {
        // get the max session id
        const resp1 = await apiGET("/admin/sessions");
        expect(resp1).toMatchObject({ status: "success" });
        checkPropTypes(PropTypes.arrayOf(sessionPropTypes), resp1.payload);
        const maxId = Math.max(...resp1.payload.map(s => s.id));

        // delete with non-existing id
        const resp2 = await apiPOST("/admin/sessions/delete", {
            id: maxId + 1 // add 1 to make the id invalid
        });
        // expected an error with non-identical session id
        expect(resp2).toMatchObject({ status: "error" });
        checkPropTypes(errorPropTypes, resp2);

        // delete with id = null
        const resp3 = await apiPOST("/admin/sessions/delete", {
            id: null
        });
        // expected an error with non-identical session id
        expect(resp3).toMatchObject({ status: "error" });
        checkPropTypes(errorPropTypes, resp3);
    });

    it("delete session", async () => {
        const resp1 = await apiPOST("/admin/sessions/delete", {
            id: session.id
        });
        expect(resp1).toMatchObject({ status: "success" });
        const { payload: withoutNewSessions } = await apiGET("/admin/sessions");
        expect(withoutNewSessions.map(x => x.id)).not.toContain(session.id);
    });
}

function templateTests(api = { apiGET, apiPOST }) {
    const { apiGET, apiPOST } = api;
    let session = null,
        testTemplates = null;

    const newTemplateData1 = {
        template_file: "this_is_a_test_template.html",
        template_name: "OTO"
    };
    const newTemplateData2 = {
        template_file: "this_is_a_test_template.html",
        template_name: "Invigilate"
    };
    // set up a session to be available before tests run
    beforeAll(async () => {
        await apiPOST("/admin/debug/snapshot");
        //await apiPOST("/admin/debug/clear_data");
        // this session will be available for all tests
        session = await addSession({ apiGET, apiPOST });
    }, 15000);
    // delete the session after the tests run
    afterAll(async () => {
        await apiPOST("/admin/debug/restore_snapshot");
    });

    it("fetch available templates", async () => {
        const resp = await apiGET("/admin/available_contract_templates");
        expect(resp).toMatchObject({ status: "success" });
        checkPropTypes(
            PropTypes.arrayOf(offerTemplateMinimalPropTypes),
            resp.payload
        );
    });

    it("add template to session", async () => {
        // grab the contract_templates of the new session. They may have
        // pre-populated.
        const resp1 = await apiGET(
            `/admin/sessions/${session.id}/contract_templates`
        );
        expect(resp1).toMatchObject({ status: "success" });
        checkPropTypes(
            PropTypes.arrayOf(offerTemplatePropTypes),
            resp1.payload
        );

        // add the new offer template
        const resp2 = await apiPOST(
            `/admin/sessions/${session.id}/contract_templates`,
            newTemplateData1
        );
        expect(resp2).toMatchObject({ status: "success" });
        checkPropTypes(offerTemplatePropTypes, resp2.payload);
        expect(resp2.payload).toMatchObject(newTemplateData1);

        // another one
        const resp3 = await apiPOST(
            `/admin/sessions/${session.id}/contract_templates`,
            newTemplateData2
        );
        expect(resp3).toMatchObject({ status: "success" });

        // fetch all templates us the templates we just created
        const resp4 = await apiGET(
            `/admin/sessions/${session.id}/contract_templates`
        );
        expect(resp4.payload).toContainObject(newTemplateData1);
        expect(resp4.payload).toContainObject(newTemplateData2);

        testTemplates = resp4.payload;
    });

    //    it("update a template", async () => {
    //        // create template had been tested
    //        const templateToUpdate = testTemplates.filter(t => {
    //            return (
    //                t.template_file === newTemplateData2.template_file &&
    //                t.template_name === newTemplateData2.template_name
    //            );
    //        });
    //        expect(templateToUpdate.length).toBe(1);
    //
    //        // update new template
    //        const updateData = {
    //            ...templateToUpdate[0],
    //            id: templateToUpdate[0].id,
    //            contract_name: "Standard"
    //        };
    //        const resp1 = await apiPOST(
    //            `/sessions/${session.id}/contract_templates`,
    //            updateData
    //        );
    //        expect(resp1).toMatchObject({ status: "success" });
    //        expect(resp1.payload).toMatchObject(updateData);
    //
    //        // make sure the template before update is gone
    //        const resp2 = await apiGET(
    //            `/sessions/${session.id}/contract_templates`
    //        );
    //        expect(resp2.payload).toContainObject(updateData);
    //    });
    //
    //    // Backend API not checking empty props. Comment out the test case for now
    //    it("throw error when `template_file` or `template_name` is empty", async () => {
    //        const newTemplateData1 = {
    //            template_file: "",
    //            template_name: "Standard"
    //        };
    //        const newTemplateData2 = {
    //            template_file: "this_is_a_test_template.html",
    //            template_name: ""
    //        };
    //
    //        // expected an error to crete new template with empty template_file
    //        const resp1 = await apiPOST(
    //            `/sessions/${session.id}/contract_templates`,
    //            newTemplateData1
    //        );
    //        expect(resp1).toMatchObject({ status: "error" });
    //        checkPropTypes(errorPropTypes, resp1);
    //
    //        // expected an error to crete new template with empty template_name
    //        const resp2 = await apiPOST(
    //            `/sessions/${session.id}/contract_templates`,
    //            newTemplateData2
    //        );
    //        expect(resp2).toMatchObject({ status: "error" });
    //        checkPropTypes(errorPropTypes, resp2);
    //
    //        // fetching the templates list and make sure it does not contain the above templates
    //        const resp3 = await apiGET(
    //            `/sessions/${session.id}/contract_templates`
    //        );
    //        expect(resp3.payload).not.toContainObject(newTemplateData1);
    //        expect(resp3.payload).not.toContainObject(newTemplateData2);
    //    });
}

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
// XXX we need to ignore eslint until we write some
// actual tests that use `apiGET` and `apiPOST`
// eslint-disable-next-line
function assignmentsTests({ apiGET, apiPOST }) {
    it.todo("get assignments for session");
    it.todo("get assignments for position");
    it.todo("create and delete assignment for position");
    it.todo("update assignment dates/note/offer_override_pdf");
}
// XXX we need to ignore eslint until we write some
// actual tests that use `apiGET` and `apiPOST`
// eslint-disable-next-line
function wageChunksTests({ apiGET, apiPOST }) {
    it.todo("get wage_chunks for position");
    it.todo("create and delete wage_chunk for position");
    it.todo("update wage_chunk");
    it.todo(
        "automatic creation of wage chunk for position when `hours` is set"
    );
}
// XXX we need to ignore eslint until we write some
// actual tests that use `apiGET` and `apiPOST`
// eslint-disable-next-line
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
// XXX we need to ignore eslint until we write some
// actual tests that use `apiGET` and `apiPOST`
// eslint-disable-next-line
function reportingTagsTests({ apiGET, apiPOST }) {
    it.todo("get reporting_tags for session");
    it.todo("get reporting_tags for position");
    it.todo("get reporting_tags for wage_chunk");
    it.todo("create and delete reporting_tags for position");
    it.todo("create and delete reporting_tags for wage_chunk");
}
// XXX we need to ignore eslint until we write some
// actual tests that use `apiGET` and `apiPOST`
// eslint-disable-next-line
function applicationsTests({ apiGET, apiPOST }) {}

function unknownRouteTests(api = { apiGet, apiPost }) {
    const { apiGet, apiPost } = api;

    it("should fail GET request with unknown '/api' routes", async () => {
        const resp = await apiGET("/some_string");
        expect(resp).toMatchObject({ status: "error" });
    });
}

// Run the actual tests for both the API and the Mock API
// describe("API tests", () => {
//     describe("`/sessions` tests", () => {
//         sessionsTests({ apiGET, apiPOST });
//     });
//     describe.only("template tests", () => {
//         templateTests({ apiGET, apiPOST });
//     });
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
// });

describe("Mock API tests", () => {
    describe("database seeding", () => {
        dataBaseSeed(mockAPI);
    });
    // describe("`/sessions` tests", () => {
    //     sessionsTests(mockAPI);
    // });
    // describe("template tests", () => {
    //     templateTests(mockAPI);
    // });
    // describe("`/positions` tests", () => {
    //     positionsTests(mockAPI);
    // });
    // describe("`/instructors` tests", () => {
    //     instructorsTests(mockAPI);
    // });
});
