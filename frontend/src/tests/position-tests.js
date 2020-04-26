import PropTypes from "prop-types";
import {
    checkPropTypes,
    positionPropTypes,
    errorPropTypes,
    expect,
    it,
    beforeAll,
    apiGET,
    apiPOST
} from "./utils";

import { databaseSeeder } from "./setup";

export function positionsTests(api = { apiGET, apiPOST }) {
    const { apiGET, apiPOST } = api;
    const session = databaseSeeder.seededData.session,
        position = databaseSeeder.seededData.position,
        contractTemplate = databaseSeeder.seededData.contractTemplate;

    let newPosition;

    beforeAll(async () => {
        await databaseSeeder.seed(api);
    });

    it("get positions for session", async () => {
        const resp1 = await apiGET(`/admin/sessions/${session.id}/positions`);

        expect(resp1).toHaveStatus("success");

        // make sure the position we created is in that list
        expect(resp1.payload).toContainObject(position);

        checkPropTypes(PropTypes.arrayOf(positionPropTypes), resp1.payload);
    });

    it("create a position", async () => {
        const newPositionData = {
            position_code: "MAT135F",
            position_title: "Calculus I",
            hours_per_assignment: 70,
            start_date: new Date("2018/05/09").toISOString(),
            end_date: new Date("2018/09/09").toISOString(),
            contract_template_id: contractTemplate.id
        };

        const resp1 = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            newPositionData
        );

        expect(resp1).toMatchObject({ status: "success" });

        newPosition = resp1.payload;

        // make sure we got back what we put in
        expect(newPosition).toMatchObject(newPositionData);
        checkPropTypes(positionPropTypes, newPosition);
        expect(newPosition.id).not.toBeNull();
        expect(newPosition.id).not.toEqual(position.id);

        // fetch all positions and make sure that the newly created position
        // is there
        const { payload: withNewPosition } = await apiGET(
            `/admin/sessions/${session.id}/positions`
        );

        expect(withNewPosition.map(x => x.id)).toContain(newPosition.id);

        expect(
            withNewPosition.filter(s => s.id === newPosition.id)
        ).toContainObject(newPosition);

        expect(withNewPosition.length).toEqual(2);
    });

    it("update a position", async () => {
        const updatedPositionData = {
            ...newPosition,
            hours_per_assignment: 75,
            start_date: new Date("2018/06/09").toISOString(),
            end_date: new Date("2018/10/09").toISOString()
        };

        const resp = await apiPOST(`/admin/positions`, updatedPositionData);
        expect(resp).toMatchObject({ status: "success" });

        const { payload: updatedPosition } = resp;
        expect(updatedPosition).toMatchObject(updatedPositionData);
        checkPropTypes(positionPropTypes, updatedPosition);
        expect(updatedPosition.id).not.toBeNull();
        expect(updatedPosition.id).toEqual(newPosition.id);

        // get the positions list and make sure we're updated there as well
        const { payload: withUpdatedPosition } = await apiGET(
            `/admin/sessions/${session.id}/positions`
        );
        expect(withUpdatedPosition).toContainObject(updatedPositionData);
        expect(withUpdatedPosition.length).toEqual(2);
    });

    it("delete position", async () => {
        const resp1 = await apiPOST(`/admin/positions/delete`, newPosition);
        expect(resp1).toMatchObject({ status: "success" });

        const resp2 = await apiGET(`/admin/sessions/${session.id}/positions`);
        expect(resp2.payload).not.toContainObject(newPosition);
    });

    it.todo("error when updating a position to have an empty position_code");

    it.todo("error when creating a position for a session with an invalid id");

    it("error when creating two positions with the same position_code in the same session", async () => {
        // we already have a position
        const newPositionData = {
            ...position,
            id: null
        };

        const resp1 = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            newPositionData
        );

        expect(resp1).toMatchObject({ status: "error" });
        checkPropTypes(errorPropTypes, resp1);
    });

    it("error when creating a positions with blank position_code", async () => {
        // we already have a position
        const resp1 = await apiPOST(`/admin/sessions/${session.id}/positions`, {
            ...position,
            id: null,
            position_code: ""
        });
        checkPropTypes(errorPropTypes, resp1);
    });

    it("succeed when creating two positions with the same code but for different sessions", async () => {
        const newSessionData = {
            start_date: new Date("2018/09/09").toISOString(),
            end_date: new Date("2018/12/31").toISOString(),
            // add a random string to the session name so we don't accidentally collide with another
            // session's name
            name: "Newly Created Sessions (" + Math.random() + ")",
            rate1: 56.54
        };

        const newPositionData2 = {
            position_code: "MAT135F",
            position_title: "Calculus I",
            hours_per_assignment: 70,
            start_date: new Date("2019/09/09").toISOString(),
            end_date: new Date("2019/12/31").toISOString(),
            contract_template_id: contractTemplate.id
        };
        // create a new session to add a template to
        const resp1 = await apiPOST("/admin/sessions", newSessionData);
        expect(resp1).toHaveStatus("success");
        const sessionId = resp1.payload.id;

        // create a new position of the same code associated with new session
        const resp2 = await apiPOST(
            `/admin/sessions/${sessionId}/positions`,
            newPositionData2
        );
        expect(resp2).toHaveStatus("success");
        // make sure we get back what we put in
        expect(resp2.payload).toMatchObject(newPositionData2);

        // make sure the position is created
        const resp3 = await apiGET(`/admin/sessions/${sessionId}/positions`);
        expect(resp3.payload).toContainObject(resp2.payload);
    });

    it.todo(
        "create a position with instructors list specified and have instructors automatically added to the position"
    );

    it.todo(
        "When the start/end_date of a position is null, the start/end_date of the sessions is returned instead"
    );
}
