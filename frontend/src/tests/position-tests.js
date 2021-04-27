import PropTypes from "prop-types";
import {
    checkPropTypes,
    positionPropTypes,
    errorPropTypes,
    expect,
    it,
    beforeAll,
    apiGET,
    apiPOST,
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
            contract_template_id: contractTemplate.id,
        };

        const resp1 = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            newPositionData
        );

        expect(resp1).toHaveStatus("success");

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

        expect(withNewPosition.map((x) => x.id)).toContain(newPosition.id);

        expect(
            withNewPosition.filter((s) => s.id === newPosition.id)
        ).toContainObject(newPosition);

        expect(withNewPosition.length).toEqual(2);
    });

    it("update a position", async () => {
        const updatedPositionData = {
            ...newPosition,
            hours_per_assignment: 75,
            start_date: new Date("2018/06/09").toISOString(),
            end_date: new Date("2018/10/09").toISOString(),
        };

        const resp = await apiPOST(`/admin/positions`, updatedPositionData);
        expect(resp).toHaveStatus("success");

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
        expect(resp1).toHaveStatus("success");

        const resp2 = await apiGET(`/admin/sessions/${session.id}/positions`);
        expect(resp2.payload).not.toContainObject(newPosition);
    });

    it("error when updating a position to have an empty position_code", async () => {
        const updatedPositionData = {
            ...newPosition,
            position_code: "",
        };

        const resp = await apiPOST(`/admin/positions`, updatedPositionData);
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);
    });

    it("error when creating a position for a session with an invalid id", async () => {
        const updatedPositionData = {
            ...newPosition,
            id: -1,
        };

        const resp = await apiPOST(`/admin/positions`, updatedPositionData);
        expect(resp).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp);
    });

    it("error when creating two positions with the same position_code in the same session", async () => {
        // we already have a position
        const newPositionData = {
            ...position,
            id: null,
        };

        const resp1 = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            newPositionData
        );

        expect(resp1).toHaveStatus("error");
        checkPropTypes(errorPropTypes, resp1);
    });

    it("error when creating a positions with blank position_code", async () => {
        // we already have a position
        const resp1 = await apiPOST(`/admin/sessions/${session.id}/positions`, {
            ...position,
            id: null,
            position_code: "",
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
            rate1: 56.54,
        };

        const newPositionData2 = {
            position_code: "MAT135F",
            position_title: "Calculus I",
            hours_per_assignment: 70,
            start_date: new Date("2019/09/09").toISOString(),
            end_date: new Date("2019/12/31").toISOString(),
            contract_template_id: contractTemplate.id,
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

    it("When the start/end_date of a position is null, the start/end_date of the sessions is returned instead", async () => {
        const newPositionData = {
            position_code: "POS100F",
            position_title: "Position with no start/end date",
            hours_per_assignment: 70,
            contract_template_id: contractTemplate.id,
        };

        const resp = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            newPositionData
        );
        expect(resp).toHaveStatus("success");

        const newPosition = resp.payload;

        // check the start/end date is the same as session
        const dates = {
            start_date: session.start_date,
            end_date: session.end_date,
        };
        expect(newPosition).toMatchObject(dates);

        // get the list of positions again and make sure the start/end
        // date is correct
        const { payload: withNewPosition } = await apiGET(
            `/admin/sessions/${session.id}/positions`
        );

        expect(
            withNewPosition.find((s) => s.id === newPosition.id)
        ).toMatchObject(dates);
    });

    it("Can update every optional field of a position", async () => {
        const optional_fields = {
            current_waitlisted: 100,
            current_enrollment: 25,
            desired_num_assignments: 6,
            hours_per_assignment: 81.5,
            duties: "A lot of different things",
            qualifications: "Hard working and such.",
        };

        const newPositionData = {
            position_code: "MAT135F",
            position_title: "Calculus I",
            hours_per_assignment: 70,
            start_date: new Date("2018/05/09").toISOString(),
            end_date: new Date("2018/09/09").toISOString(),
            contract_template_id: contractTemplate.id,
        };

        let resp = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            newPositionData
        );
        expect(resp).toHaveStatus("success");
        const position = resp.payload;

        for (const [field, val] of Object.entries(optional_fields)) {
            resp = await apiPOST(`/admin/sessions/${session.id}/positions`, {
                ...position,
                [field]: val,
            });
            expect(resp).toHaveStatus("success");
            expect(resp.payload[field]).toEqual(val);
        }
    });
}
