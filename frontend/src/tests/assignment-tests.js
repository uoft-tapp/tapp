import PropTypes from "prop-types";
import {
    it,
    expect,
    beforeAll,
    checkPropTypes,
    assignmentPropTypes
} from "./utils";
import { databaseSeeder } from "./setup";

export function assignmentsTests({ apiGET, apiPOST }) {
    const session = databaseSeeder.seededData.session;
    const position = databaseSeeder.seededData.position;
    const assignment = databaseSeeder.seededData.assignment;

    beforeAll(async () => {
        await apiPOST("/debug/restore_snapshot");
    }, 30000);

    it("get assignments for session", async () => {
        const resp = await apiGET(`/admin/sessions/${session.id}/assignments`);

        expect(resp).toMatchObject({ status: "success" });
        // make sure we got the seeded assignment data
        expect(resp.payload).toMatchObject([assignment]);
        // check the type of payload
        checkPropTypes(PropTypes.arrayOf(assignmentPropTypes), resp.payload);
    });

    it("update assignment dates/note/offer_override_pdf/hours", async () => {
        // update dates/note/offer_override_pdf/hours"
        const updatedAssignmentData = {
            ...assignment,
            start_date: "2019-09-05T00:00:00.000Z",
            end_date: "2019-12-25T00:00:00.000Z",
            note: "updated",
            offer_override_pdf: "pdf",
            hours: 80
        };

        const resp = await apiPOST(`/admin/assignments`, updatedAssignmentData);
        expect(resp).toMatchObject({ status: "success" });

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

        expect(withUpdatedAssignment.map(x => x.id)).toContain(
            updatedAssignment.id
        );
        expect(
            withUpdatedAssignment.filter(s => s.id === updatedAssignment.id)
        ).toContainObject(updatedAssignment);

        expect(withUpdatedAssignment.length).toEqual(1);
    });

    it("create assignment for position", async () => {
        // create a new applicant to assign
        const newApplicantData = {
            utorid: "weasleyr",
            student_number: "89013443",
            first_name: "Ron",
            last_name: "Weasley",
            email: "ron@potter.com",
            phone: "543-223-9993"
        };
        const { payload: applicant } = await apiPOST(
            "/admin/applicants",
            newApplicantData
        );

        // create new assignment
        const newAssignmentData = {
            note: "",
            position_id: position.id,
            applicant_id: applicant.id,
            start_date: "2019-09-02T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z"
        };
        const resp = await apiPOST("/admin/assignments", newAssignmentData);

        expect(resp).toMatchObject({ status: "success" });
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

        expect(withNewAssignments.map(x => x.id)).toContain(
            createdAssignment.id
        );
        expect(
            withNewAssignments.filter(s => s.id === createdAssignment.id)
        ).toContainObject(createdAssignment);

        expect(withNewAssignments.length).toEqual(2);
    });

    it("get assignment by id", async () => {
        const resp = await apiGET(
            `/admin/sessions/${session.id}/assignments/${assignment.id}`
        );

        expect(resp).toMatchObject({ status: "success" });
        // make sure we got the seeded assignment data
        expect(resp.payload).toMatchObject(assignment);
        // check the type of payload
        checkPropTypes(PropTypes.arrayOf(assignmentPropTypes), resp.payload);
    });
}
