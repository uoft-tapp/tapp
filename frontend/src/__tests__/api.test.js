import PropTypes from "prop-types";
import { apiGET, apiPOST, checkPropTypes, sessionPropTypes } from "./utils";
import { mockAPI } from "../api/mockAPI";
// eslint-disable-next-line
const { describe, it, expect } = global;
//global.XMLHttpRequest = undefined

/**
 * Tests for the API. These are encapsulated in a function so that
 * different `apiGET` and `apiPOST` functions can be passed in. For example,
 * they may be functions that make actual requests via http or they may
 * be from the mock API.
 *
 * @param {Function} apiGET
 * @param {Function} apiPOST
 */
function apiTests(apiGET, apiPOST) {
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
}
describe("API tests", () => {
    apiTests(apiGET, apiPOST);
});

describe("Mock API tests", () => {
    apiTests(
        (...args) => mockAPI.apiGET(...args),
        (...args) => mockAPI.apiPOST(...args)
    );
});
