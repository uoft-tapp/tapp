import PropTypes from "prop-types";
import {
    it,
    expect,
    beforeAll,
    checkPropTypes,
    assignmentPropTypes,
} from "./utils";
import { databaseSeeder } from "./setup";

export function assignmentsTests(api) {
    const { apiGET, apiPOST } = api;
    let session;
    let applicant;
    let assignment;
    let contractTemplate;

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        session = databaseSeeder.seededData.session;
        applicant = databaseSeeder.seededData.applicant;
        assignment = databaseSeeder.seededData.assignment;
        contractTemplate = databaseSeeder.seededData.contractTemplate;
    }, 30000);

    it("get assignments for session", async () => {
        const resp = await apiGET(`/admin/sessions/${session.id}/assignments`);

        expect(resp).toHaveStatus("success");
        // make sure we got the seeded assignment data
        expect(resp.payload).toMatchObject([assignment]);
        // check the type of payload
        checkPropTypes(PropTypes.arrayOf(assignmentPropTypes), resp.payload);
    });

    it("create assignment for position", async () => {
        // create a new position to assign
        const newPositionData = {
            position_code: "CSC100F",
            position_title: "Basic Computer Science",
            hours_per_assignment: 70,
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
            position_id: position.id,
            applicant_id: applicant.id,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
        };
        const resp = await apiPOST("/admin/assignments", newAssignmentData);

        expect(resp).toHaveStatus("success");
        const { payload: createdAssignment } = resp;
        // make sure the propTypes are right
        checkPropTypes(assignmentPropTypes, createdAssignment);
        expect(createdAssignment.id).not.toBeNull();
        expect(createdAssignment.id).not.toEqual(assignment.id);

        // fetch all assignments and make sure the newly added
        // assignment data is there
        const { payload: withNewAssignments } = await apiGET(
            `/admin/sessions/${session.id}/assignments`
        );

        expect(withNewAssignments.map((x) => x.id)).toContain(
            createdAssignment.id
        );
        expect(
            withNewAssignments.filter((s) => s.id === createdAssignment.id)
        ).toContainObject(createdAssignment);

        expect(withNewAssignments.length).toEqual(2);
    });

    it("get assignment by id", async () => {
        const resp = await apiGET(`/admin/assignments/${assignment.id}`);

        expect(resp).toHaveStatus("success");
        // make sure we got the seeded assignment data
        expect(resp.payload).toMatchObject(assignment);
        // check the type of payload
        checkPropTypes(assignmentPropTypes, resp.payload);
    });

    it("update assignment dates/note/contract_override_pdf/hours", async () => {
        // update dates/note/contract_override_pdf/hours"
        const updatedAssignmentData = {
            ...assignment,
            start_date: "2019-09-05T00:00:00.000Z",
            end_date: "2019-12-25T00:00:00.000Z",
            note: "updated",
            contract_override_pdf: "pdf",
            hours: 80,
        };

        const resp = await apiPOST(`/admin/assignments`, updatedAssignmentData);
        expect(resp).toHaveStatus("success");

        const { payload: updatedAssignment } = resp;
        // make sure the propTypes are right
        checkPropTypes(assignmentPropTypes, updatedAssignment);
        expect(updatedAssignment.id).not.toBeNull();
        expect(updatedAssignment.id).toEqual(assignment.id);

        // fetch all assignments and make sure the newly added
        // assignment data is there
        const { payload: withUpdatedAssignment } = await apiGET(
            `/admin/sessions/${session.id}/assignments`
        );

        expect(withUpdatedAssignment.map((x) => x.id)).toContain(
            updatedAssignment.id
        );
        expect(
            withUpdatedAssignment.filter((s) => s.id === updatedAssignment.id)
        ).toContainObject(updatedAssignment);

        expect(withUpdatedAssignment.length).toEqual(2);
    });

    it("assignments created with null start/end_date inherit the start/end_date from the parent position", async () => {
        // create a new position to assign
        const newPositionData = {
            position_code: "CSC100F",
            position_title: "Basic Computer Science",
            hours_per_assignment: 70,
            start_date: "2019/09/09",
            end_date: "2019/12/31",
            contract_template_id: contractTemplate.id,
        };

        const { payload: position } = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            newPositionData
        );

        // create new assignment with no start or end date.
        const newAssignmentData = {
            note: "",
            position_id: position.id,
            applicant_id: applicant.id,
            start_date: null,
            end_date: null,
        };
        const resp = await apiPOST("/admin/assignments", newAssignmentData);

        expect(resp).toHaveStatus("success");
        const { payload: createdAssignment } = resp; //I have a lot of questions about this line.
        // make sure the propTypes are right
        checkPropTypes(assignmentPropTypes, createdAssignment);
        expect(createdAssignment.id).not.toBeNull();
        expect(createdAssignment.id).not.toEqual(assignment.id);
        expect(createdAssignment.start_date).toEqual(newPositionData.start_date);
        expect(createdAssignment.end_date).toEqual(newPositionData.end_date);

        // fetch all assignments and make sure the newly added
        // assignment data is there
        const { payload: withNewAssignments } = await apiGET(
            `/admin/sessions/${session.id}/assignments`
        );

        expect(withNewAssignments.map((x) => x.id)).toContain(
            createdAssignment.id
        );
        expect(
            withNewAssignments.filter((s) => s.id === createdAssignment.id)
        ).toContainObject(createdAssignment);

        expect(withNewAssignments.length).toEqual(2);
    });
}
