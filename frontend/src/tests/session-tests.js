/**
 * @jest-environment node
 */
import PropTypes from "prop-types";
import {
    it,
    expect,
    beforeAll,
    checkPropTypes,
    sessionPropTypes,
    errorPropTypes
} from "./utils";
import { databaseSeeder } from "./setup";
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
export function sessionsTests(api) {
    const { apiGET, apiPOST } = api;
    let session = null;

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        session = databaseSeeder.seededData.session;
    }, 30000);

    const newSessionData = {
        start_date: new Date("2019/09/09").toISOString(),
        end_date: new Date("2019/12/31").toISOString(),
        // add a random string to the session name so we don't accidentally collide with another
        // session's name
        name: "Newly Created Sessions (" + Math.random() + ")",
        rate1: 56.54
    };

    it("fetch sessions", async () => {
        // do we get a success response when geting all sessions from snapshot
        const resp = await apiGET("/admin/sessions");
        expect(resp).toHaveStatus("success");

        // check the type of payload
        checkPropTypes(PropTypes.arrayOf(sessionPropTypes), resp.payload);

        // compare the responsed session and seeded session they should be exactly the same
        const responsedSession = resp.payload[0];
        const seededSession = databaseSeeder.seededData.session;
        expect(responsedSession).toEqual(seededSession);
    });

    it("create a session", async () => {
        // get all the sessions so that we can check that our newly inserted session has
        // a unique id.
        const { payload: initialSessions } = await apiGET("/admin/sessions");

        // do we get a success response when creating the session?
        const resp1 = await apiPOST("/admin/sessions", newSessionData);
        expect(resp1).toHaveStatus("success");
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
        expect(withNewSessions).toContainObject(createdSession);
        // make sure the id of our new session came back
        expect(withNewSessions.map(x => x.id)).toContain(createdSession.id);
    });

    it("update a session", async () => {
        const newData = { ...session, rate1: 57.75 };
        const resp1 = await apiPOST("/admin/sessions", newData);

        expect(resp1).toHaveStatus("success");
        expect(resp1.payload).toMatchObject(newData);

        // get the sessions list and make sure we're updated there as well
        const resp2 = await apiGET("/admin/sessions");
        // filter session list to get the updated session obj
        const updatedSession = resp2.payload.filter(s => s.id == session.id);
        expect(updatedSession).toContainObject(newData);
    });

    it("throw error on create when `name` is empty", async () => {
        // create new session with empty name
        const newData1 = { ...newSessionData, name: "" };
        const newData2 = { ...newSessionData, name: undefined };

        const resp1 = await apiPOST("/admin/sessions", newData1);
        expect(resp1).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp1);

        const resp2 = await apiPOST("/admin/sessions", newData2);
        expect(resp2).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp2);
    });

    it("throw error on update when `name` is empty", async () => {
        // update a session with invalid name
        const newData1 = { ...session, name: "" };
        const newData2 = { ...session, name: null };
        const resp1 = await apiPOST("/admin/sessions", newData1);

        expect(resp1).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp1);

        const resp2 = await apiPOST("/admin/sessions", newData2);
        expect(resp2).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp2);
    });

    it("throw error on create when `name` is not unique", async () => {
        // name identical to the existing session
        const newData = { ...newSessionData, name: session.name };
        // POST to create new session
        const resp1 = await apiPOST("/admin/sessions", newData);

        // expected an error as name not unique
        expect(resp1).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp1);
    });

    it("throw error on update when `name` is not unique", async () => {
        // name identical to the existing session with a valid id
        const newData = { ...session, name: newSessionData.name };
        // POST to update the session
        const resp1 = await apiPOST("/admin/sessions", newData);

        // expected an error as name not unique
        expect(resp1).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp1);
    });

    it("throw error when deleting item with invalid id", async () => {
        // get the max session id
        const resp1 = await apiGET("/admin/sessions");
        expect(resp1).toHaveStatus("success");
        checkPropTypes(PropTypes.arrayOf(sessionPropTypes), resp1.payload);
        const maxId = Math.max(...resp1.payload.map(s => s.id));

        // delete with non-existing id
        const resp2 = await apiPOST("/admin/sessions/delete", {
            id: maxId + 1 // add 1 to make the id invalid
        });
        // expected an error with non-identical session id
        expect(resp2).toHaveStatus("error");
        expect(resp2).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp2);

        // delete with id = null
        const resp3 = await apiPOST("/admin/sessions/delete", {
            id: null
        });
        // expected an error with non-identical session id
        expect(resp3).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp3);
    });

    it("delete session", async () => {
        const resp1 = await apiPOST("/admin/sessions/delete", {
            id: session.id
        });
        expect(resp1).toHaveStatus("success");
        const { payload: withoutNewSessions } = await apiGET("/admin/sessions");
        expect(withoutNewSessions.map(x => x.id)).not.toContain(session.id);
    });
}
