import PropTypes from "prop-types";
import {
    apiGET,
    apiPOST,
    checkPropTypes,
    sessionPropTypes,
    offerTemplateMinimalPropTypes,
    offerTemplatePropTypes
} from "./utils";
import { mockAPI } from "../api/mockAPI";
// eslint-disable-next-line
const { describe, it, expect } = global;

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
 * Tests for the API. These are encapsulated in a function so that
 * different `apiGET` and `apiPOST` functions can be passed in. For example,
 * they may be functions that make actual requests via http or they may
 * be from the mock API.
 *
 * @param {Function} apiGET
 * @param {Function} apiPOST
 */
function sessionsTests(apiGET, apiPOST) {
    it("fetch sessions", async () => {
        const resp = await apiGET("/sessions");

        expect(resp).toMatchObject({ status: "success" });
        checkPropTypes(PropTypes.arrayOf(sessionPropTypes), resp.payload);
    });
    it("create and delete session", async () => {
        const newSessionData = {
            start_date: "2019/09/09",
            end_date: "2019/12/31",
            // add a random string to the session name so we don't accidentally collide with another
            // session's name
            name: "Newly Created Sessions (" + Math.random() + ")",
            rate1: 56.54
        };
        // get all the sessions so that we can check that our newly inserted session has
        // a unique id.
        const { payload: initialSessions } = await apiGET("/sessions");
        // do we get a success response when creating the session?
        const resp1 = await apiPOST("/sessions", newSessionData);
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
        const { payload: withNewSessions } = await apiGET("/sessions");
        expect(withNewSessions.length).toBeGreaterThan(initialSessions.length);
        // make sure the id of our new session came back
        expect(withNewSessions.map(x => x.id)).toContain(createdSession.id);

        // now delete the session and make sure it's gone
        const resp2 = await apiPOST("/sessions/delete", {
            id: createdSession.id
        });
        expect(resp2).toMatchObject({ status: "success" });
        const { payload: withoutNewSessions } = await apiGET("/sessions");
        expect(withoutNewSessions.map(x => x.id)).not.toContain(
            createdSession.id
        );
    });
    it.todo("throw error when `name` is empty");
    it.todo("throw error when `name` is not unique");
    it.todo("throw error when deleting item with invalid id");
}
function templateTests(apiGET, apiPOST) {
    it("fetch available templates", async () => {
        const resp = await apiGET("/available_position_templates");

        expect(resp).toMatchObject({ status: "success" });
        checkPropTypes(
            PropTypes.arrayOf(offerTemplateMinimalPropTypes),
            resp.payload
        );
    });
    it("add template to session", async () => {
        const newSessionData = {
            start_date: "2019/09/09",
            end_date: "2019/12/31",
            // add a random string to the session name so we don't accidentally collide with another
            // session's name
            name: "Newly Created Sessions (" + Math.random() + ")",
            rate1: 56.54
        };
        const newTemplateData = {
            offer_template: "this_is_a_test_template.html",
            position_type: "OTO"
        };
        const newTemplateData2 = {
            offer_template: "this_is_a_test_template.html",
            position_type: "Invigilate"
        };
        // create a new session to add a template to
        const resp1 = await apiPOST("/sessions", newSessionData);
        expect(resp1).toMatchObject({ status: "success" });
        const sessionId = resp1.payload.id;

        // grab the position_templates of the new session. They may have
        // pre-populated.
        const resp2 = await apiGET(`/sessions/${sessionId}/position_templates`);
        expect(resp2).toMatchObject({ status: "success" });
        checkPropTypes(
            PropTypes.arrayOf(offerTemplatePropTypes),
            resp2.payload
        );

        // add the new offer template
        const resp3 = await apiPOST(
            `/sessions/${sessionId}/add_position_template`,
            newTemplateData
        );
        expect(resp3).toMatchObject({ status: "success" });
        checkPropTypes(
            PropTypes.arrayOf(offerTemplatePropTypes),
            resp3.payload
        );
        expect(resp3.payload).toContainObject(newTemplateData);

        // another one -- it should contain both of our added templates
        const resp4 = await apiPOST(
            `/sessions/${sessionId}/add_position_template`,
            newTemplateData2
        );
        expect(resp4.payload).toContainObject(newTemplateData);
        expect(resp4.payload).toContainObject(newTemplateData2);

        // fetching the templates again should give us the same list
        const resp5 = await apiGET(`/sessions/${sessionId}/position_templates`);
        expect(resp5.payload).toEqual(resp4.payload);

        // clean up by deleting the session
        await apiPOST("/sessions/delete", {
            id: sessionId
        });
    });
    it.todo("throw error when `offer_template` or `position_type` is empty");
    it.todo("throw error when `position_type` is not unique");
}
// XXX we need to ignore eslint until we write some
// actual tests that use `apiGET` and `apiPOST`
// eslint-disable-next-line
function positionsTests(apiGET, apiPOST) {
    it.todo("get positions for session");
    it.todo("create and delete position");
    it.todo("update a position");
    it.todo("set the position type");
}
// XXX we need to ignore eslint until we write some
// actual tests that use `apiGET` and `apiPOST`
// eslint-disable-next-line
function instructorsTests(apiGET, apiPOST) {
    it.todo("get instructors");
    it.todo("get instructors for session");
    it.todo("create and delete instructor");
    it.todo("update an instructor");
    it.todo("add and remove instructor from position");
}
// XXX we need to ignore eslint until we write some
// actual tests that use `apiGET` and `apiPOST`
// eslint-disable-next-line
function assignmentsTests(apiGET, apiPOST) {
    it.todo("get assignments for session");
    it.todo("get assignments for position");
    it.todo("create and delete assignment for position");
    it.todo("update assignment dates/note/offer_override_pdf");
}
// XXX we need to ignore eslint until we write some
// actual tests that use `apiGET` and `apiPOST`
// eslint-disable-next-line
function wageChunksTests(apiGET, apiPOST) {
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
function offersTests(apiGET, apiPOST) {
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
function reportingTagsTests(apiGET, apiPOST) {
    it.todo("get reporting_tags for session");
    it.todo("get reporting_tags for position");
    it.todo("get reporting_tags for wage_chunk");
    it.todo("create and delete reporting_tags for position");
    it.todo("create and delete reporting_tags for wage_chunk");
}
// XXX we need to ignore eslint until we write some
// actual tests that use `apiGET` and `apiPOST`
// eslint-disable-next-line
function applicationsTests(apiGET, apiPOST) {}

// Run the actual tests for both the API and the Mock API
describe("API tests", () => {
    describe("`/sessions` tests", () => {
        sessionsTests(apiGET, apiPOST);
    });
    describe("template tests", () => {
        templateTests(apiGET, apiPOST);
    });
    describe("`/positions` tests", () => {
        positionsTests(apiGET, apiPOST);
    });
    describe("`/instructors` tests", () => {
        instructorsTests(apiGET, apiPOST);
    });
    describe("`/assignments` tests", () => {
        assignmentsTests(apiGET, apiPOST);
    });
    describe("wage_chunk tests", () => {
        wageChunksTests(apiGET, apiPOST);
    });
    describe("offers tests", () => {
        offersTests(apiGET, apiPOST);
    });
    describe("reporting_tag tests", () => {
        reportingTagsTests(apiGET, apiPOST);
    });
    describe("`/applications` tests", () => {
        applicationsTests(apiGET, apiPOST);
    });
});

describe("Mock API tests", () => {
    describe("`/sessions` tests", () => {
        sessionsTests(mockAPI.apiGET, mockAPI.apiPOST);
    });
});
