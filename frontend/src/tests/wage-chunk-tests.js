import PropTypes from "prop-types";
import {
    checkPropTypes,
    wageChunkPropTypes,
    expect,
    it,
    beforeAll,
} from "./utils";

import { databaseSeeder } from "./setup";

// TODO: Remove eslint disable
// eslint-disable-next-line
export function wageChunksTests(api) {
    const { apiGET, apiPOST } = api;
    const { applicant, assignment, contractTemplate, session } =
        databaseSeeder.seededData;

    let originalWageChunk, newWageChunk;

    beforeAll(async () => {
        await databaseSeeder.seed(api);
    });

    it("get wage_chunks for position", async () => {
        const resp = await apiGET(
            `/admin/assignments/${assignment.id}/wage_chunks`
        );
        expect(resp).toHaveStatus("success");

        const wageChunkData = {
            hours: assignment.hours,
        };

        // make sure the position we created is in that list
        expect(resp.payload).toContainObject(wageChunkData);

        checkPropTypes(PropTypes.arrayOf(wageChunkPropTypes), resp.payload);

        originalWageChunk = resp.payload[0];
    });

    it("create wage_chunk for assignment using `/admin/wage_chunks` route", async () => {
        const newWageChunkData = {
            assignment_id: assignment.id,
            hours: 20,
            start_date: new Date("2018/05/09").toISOString(),
            end_date: new Date("2018/09/09").toISOString(),
            rate: 10.01,
        };
        const resp = await apiPOST(`/admin/wage_chunks`, newWageChunkData);
        expect(resp).toHaveStatus("success");

        newWageChunk = resp.payload;
        expect(newWageChunk).toMatchObject(newWageChunkData);
        checkPropTypes(wageChunkPropTypes, newWageChunk);
        expect(newWageChunk.id).not.toBeNull();

        // get the wage chunk list and make sure we're updated there as well
        const { payload: withNewWageChunk } = await apiGET(
            `/admin/assignments/${assignment.id}/wage_chunks`
        );

        expect(newWageChunk).toMatchObject(
            withNewWageChunk.find((x) => x.id === newWageChunk.id)
        );
        expect(withNewWageChunk.length).toEqual(2);

        // ensure that the hours attribute of assignment is updated
        const { payload: withUpdatedAssignmentHours } = await apiGET(
            `/admin/assignments/${assignment.id}`
        );

        expect(withUpdatedAssignmentHours.hours).toEqual(
            assignment.hours + newWageChunkData.hours
        );
    });

    it("create wage_chunk for assignment using `/admin/assignments/{assignment_id}/wage_chunks` route", async () => {
        // Clear the wage chunks for the assignment so that we can create new ones
        let resp1 = await apiPOST(
            `/admin/assignments/${assignment.id}/wage_chunks`,
            []
        );
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload.length).toEqual(0);

        const newWageChunk1 = {
            hours: 30,
            start_date: new Date("2018/05/09").toISOString(),
            end_date: new Date("2018/09/09").toISOString(),
            rate: 15,
        };

        resp1 = await apiPOST(
            `/admin/assignments/${assignment.id}/wage_chunks`,
            [newWageChunk1]
        );
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload.length).toEqual(1);
        expect(resp1.payload).toContainObject(newWageChunk1);

        // The wage chunk should have the `assignment_id` field
        // added by the backend
        expect(resp1.payload[0].assignment_id).toEqual(assignment.id);
        Object.assign(newWageChunk1, resp1.payload[0]);

        // If we insert a second wage chunk but pass in the same first wage chunk
        // (with its `id` field), then the first wage chunk should remain identical
        // but the second wage chunk should be added.
        const newWageChunk2 = {
            hours: 60,
            start_date: new Date("2018/12/01").toISOString(),
            end_date: new Date("2019/04/04").toISOString(),
            rate: 16,
        };
        resp1 = await apiPOST(
            `/admin/assignments/${assignment.id}/wage_chunks`,
            [newWageChunk1, newWageChunk2]
        );
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload.length).toEqual(2);
        expect(resp1.payload).toContainObject(newWageChunk1);
        expect(resp1.payload).toContainObject(newWageChunk2);

        // Fetch the assignment and make sure the hours are recomputed
        resp1 = await apiGET(`/admin/assignments/${assignment.id}`);
        expect(resp1).toHaveStatus("success");
        expect(resp1.payload.hours).toEqual(
            newWageChunk1.hours + newWageChunk2.hours
        );

        // Later tests assume that `originalWageChunk` is a wage chunk that is currently
        // set on `assignment`. Since we removed it earlier in this test,
        // re-save it.
        originalWageChunk = newWageChunk1;
    });

    it("update wage_chunk", async () => {
        const updatedWageChunkData = {
            ...originalWageChunk,
            hours: 40,
            start_date: new Date("2018/08/09").toISOString(),
            end_date: new Date("2018/10/09").toISOString(),
            rate: 12.01,
        };

        const resp = await apiPOST(`/admin/wage_chunks`, updatedWageChunkData);
        expect(resp).toHaveStatus("success");

        const { payload: updatedWageChunk } = resp;
        expect(updatedWageChunk).toMatchObject(updatedWageChunkData);
        checkPropTypes(wageChunkPropTypes, updatedWageChunk);
        expect(updatedWageChunk.id).not.toBeNull();
        expect(updatedWageChunk.id).toEqual(originalWageChunk.id);

        // get the wage chunk list and make sure we're updated there as well
        const { payload: withUpdatedWageChunk } = await apiGET(
            `/admin/assignments/${assignment.id}/wage_chunks`
        );
        expect(withUpdatedWageChunk).toContainObject(updatedWageChunkData);
        expect(withUpdatedWageChunk.length).toEqual(2);
    });

    it("delete wage_chunk", async () => {
        const resp = await apiPOST(
            `/admin/wage_chunks/delete`,
            originalWageChunk
        );
        expect(resp).toHaveStatus("success");

        // get the wage chunk list and make sure we're updated there as well
        const { payload: withUpdatedWageChunk } = await apiGET(
            `/admin/assignments/${assignment.id}/wage_chunks`
        );
        expect(withUpdatedWageChunk).not.toContainObject(originalWageChunk);
        expect(withUpdatedWageChunk.length).toEqual(1);
    });

    it("automatic creation of wage chunk for position when `hours` is set", async () => {
        // create a new position to assign
        const newPositionData = {
            position_code: "CSC100F",
            position_title: "Basic Computer Science",
            hours_per_assignment: 150,
            start_date: "2019/09/09",
            end_date: "2019/12/31",
            contract_template_id: contractTemplate.id,
        };

        const { payload: position } = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            newPositionData
        );

        // create new assignment
        const newAssignmentData = {
            note: "",
            hours: 150,
            position_id: position.id,
            applicant_id: applicant.id,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
        };

        const { payload: newAssignment } = await apiPOST(
            "/admin/assignments",
            newAssignmentData
        );

        const resp = await apiGET(
            `/admin/assignments/${newAssignment.id}/wage_chunks`
        );
        expect(resp).toHaveStatus("success");

        const wageChunkData = {
            hours: newPositionData.hours_per_assignment,
        };

        // make sure the position we created is in that list
        expect(resp.payload).toContainObject(wageChunkData);

        checkPropTypes(PropTypes.arrayOf(wageChunkPropTypes), resp.payload);
    });
}
