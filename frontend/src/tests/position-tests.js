import PropTypes from "prop-types";
import {
    apiGET,
    apiPOST,
    checkPropTypes,
    positionPropTypes,
    errorPropTypes,
    expect,
    it,
    beforeAll
} from "./utils";

import { databaseSeeder } from "./setup";

export function positionsTests(api = { apiGET, apiPOST }) {
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
        await apiPOST("/debug/restore_snapshot");
        session = databaseSeeder.seededData.session;
        contractTemplate = databaseSeeder.seededData.contractTemplate;
        newPositionData.contract_template_id = contractTemplate.id;
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
