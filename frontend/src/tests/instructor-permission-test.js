import {
    it,
    expect,
    beforeAll,
    describe,
    checkPropTypes,
    errorPropTypes,
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
export function instructorsPermissionTests(api) {
    // eslint-disable-next-line
    const { apiGET, apiPOST } = api;
    let session = null;
    let assignment;
    let instructorUser;
    let defaultUser;
    let existingContractTemplateId;

    /**
     * Switches the current active user to a user with only the instructor role.
     * This function uses debug route to achieve user switching.
     *
     * @returns {Promise<void>}
     */
    async function switchToInstructorOnlyUser() {
        let respSwitchToInstOnlyUser = await apiPOST(
            `/debug/active_user`,
            instructorUser
        );
        expect(respSwitchToInstOnlyUser).toHaveStatus("success");
    }

    /**
     * Restores the active user to the default user (the user logged during test setup in beforeAll).
     *
     * @returns {Promise<void>}
     */
    async function restoreDefaultUser() {
        let respSwitchBackUser = await apiPOST(
            `/debug/active_user`,
            defaultUser
        );
        expect(respSwitchBackUser).toHaveStatus("success");
    }

    /**
     * Updates a position to include instructor with `instructorId` and
     * creates a DDAH for one of the assignments realted to that
     * instructor.
     *
     * @param instructorId: int - the unique Id of an instructor
     *
     * @returns {Promise<Ddah>}
     */
    async function createDdahWithFixedDuties(instructorId) {
        // We first need to update position to include our instructor
        const existingPosition = databaseSeeder.seededData.positions[0];
        const positionWithInstructor = {
            ...existingPosition,
            instructor_ids: [...existingPosition.instructor_ids, instructorId],
        };
        let resp = await apiPOST(`/admin/positions`, positionWithInstructor);
        expect(resp).toHaveStatus("success");

        // We then proceed to create a DDAH for that position
        resp = await apiGET(`/instructor/sessions/${session.id}/assignments`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload.length).toBeGreaterThan(0);
        assignment = resp.payload[0];
        const newDdah = {
            assignment_id: assignment.id,
            duties: [
                {
                    order: 2,
                    hours: 25,
                    description: "marking:Marking the midterm",
                },
                {
                    order: 1,
                    hours: 4,
                    description: "training:Initial training",
                },
                {
                    order: 3,
                    hours: 40,
                    description: "contact:Running tutorials",
                },
            ],
        };

        resp = await apiPOST(`/admin/ddahs`, newDdah);
        expect(resp).toHaveStatus("success");
        return resp.payload;
    }

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        await databaseSeeder.seedForInstructors(api);
        session = databaseSeeder.seededData.session;

        // default user should have both admin and instructor roles
        let resp = await apiGET(`/debug/active_user`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload.roles).toEqual(
            expect.arrayContaining(["instructor", "admin"])
        );
        defaultUser = resp.payload;

        resp = await apiGET(`/admin/sessions/${session.id}/contract_templates`);
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toEqual(
            expect.arrayContaining([expect.anything()])
        );
        existingContractTemplateId = resp.payload[0].id;

        const instructorOnlyUserData = {
            utorid: "instructor_only_test_user_utorid",
            roles: ["instructor"],
        };

        resp = await apiPOST(`/debug/users`, instructorOnlyUserData);
        expect(resp).toHaveStatus("success");

        resp = await apiGET(`/debug/users`);
        expect(resp).toHaveStatus("success");

        instructorUser = resp.payload.find(
            (user) => user.utorid === instructorOnlyUserData.utorid
        );

        expect(instructorUser).toBeDefined();
        expect(instructorUser.roles).toEqual(
            expect.arrayContaining(["instructor"])
        );
    }, 30000);

    it("assigning to be instructor of a course grants instructor role", async () => {
        await restoreDefaultUser();
        const emptyRoleUserUtorid =
            "course_assign_grant_instructor_test_user_utorid";
        const emptyRoleUserData = {
            utorid: emptyRoleUserUtorid,
            roles: [],
        };

        let resp = await apiPOST(`/debug/users`, emptyRoleUserData);
        expect(resp).toHaveStatus("success");
        expect(resp.payload.roles).toEqual(
            expect.not.arrayContaining(["instructor"])
        );

        resp = await apiGET(`/debug/users`);
        expect(resp).toHaveStatus("success");

        const emptyRoleUserExists = resp.payload.some(
            (user) => user.utorid === emptyRoleUserData.utorid
        );

        expect(emptyRoleUserExists).toBeTruthy();

        const instructorData = {
            utorid: emptyRoleUserUtorid,
            first_name: "doe",
            last_name: "jane",
            email: "janedoe@mail.com",
        };
        resp = await apiPOST(`/admin/instructors`, instructorData);
        expect(resp).toHaveStatus("success");

        resp = await apiGET(`/admin/instructors`);
        expect(resp).toHaveStatus("success");
        const instructorId = resp.payload.find(
            (instructor) => instructor.utorid === emptyRoleUserUtorid
        );
        expect(instructorId).toBeDefined();

        const testPosition = {
            position_code: "course_assign_grant_instructor_test_position_code",
            position_title:
                "course assign grant instructor test position title",
            hours_per_assignment: 1.0,
            contract_template_id: existingContractTemplateId,
            duties: "Tutorials",
            instructor_ids: [instructorId],
        };

        // upon successfully making the following position upsert, the no-role user should be granted instructor role
        resp = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            testPosition
        );
        expect(resp).toHaveStatus("success");

        resp = await apiGET(`/admin/users`);
        expect(resp).toHaveStatus("success");
        const updatedUser = resp.payload.find(
            (user) => user.utorid === emptyRoleUserData.utorid
        );
        expect(updatedUser).toBeDefined();
        expect(updatedUser.roles).toEqual(
            expect.arrayContaining(["instructor"])
        );
    });

    it("fetch instructors", async () => {
        await restoreDefaultUser();
        // Get instructors from the admin route
        let resp = await apiGET("/admin/instructors");
        expect(resp).toHaveStatus("success");
        // All the seeded instructors should be listed
        expect(resp.payload).toContainObject({
            utorid: "smithh",
        });
        expect(resp.payload).toContainObject({
            utorid: "garciae",
        });
        expect(resp.payload).toContainObject({
            utorid: "millerm",
        });

        // "smithh" and "garciae" teach together, but don't teach with "millerm",
        // so when "smithh" requests a list of instructors, they should get a list
        // that contains only the instructor they co-teach with.
        resp = await apiGET("/instructor/instructors");
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toContainObject({
            utorid: "smithh",
        });
        expect(resp.payload).toContainObject({
            utorid: "garciae",
        });
        expect(resp.payload).not.toContainObject({
            utorid: "millerm",
        });
    });

    it("can't update instructors except for self (i.e. active user)", async () => {
        // we use the default user's admin privilege here to fetch an unrelated instructor
        let respFetchInst = await apiGET(`/instructor/instructors`);
        expect(respFetchInst).toHaveStatus("success");

        let respFetchDefaultUser = await apiGET(`/instructor/active_user`);
        expect(respFetchDefaultUser).toHaveStatus("success");
        const defaultUser = respFetchDefaultUser.payload;

        const defaultUserWithUpdatedInformation = { ...defaultUser };
        defaultUserWithUpdatedInformation.email =
            "instructor_permission_instructor_update_test@test.com";

        // instructor does not have permission to update other instructors' information
        // in this example, the instructor-only-user should not have permission to update the default user's information
        await switchToInstructorOnlyUser();
        let respInvalidRouteWithSession = await apiPOST(
            `/instructor/instructors`,
            defaultUserWithUpdatedInformation
        );
        expect(respInvalidRouteWithSession).toHaveStatus("error");
        checkPropTypes(errorPropTypes, respInvalidRouteWithSession);

        await restoreDefaultUser();

        // instructors have permission to modify their own information
        let respModDefaultUser = await apiPOST(
            `/instructor/instructors`,
            defaultUserWithUpdatedInformation
        );
        expect(respModDefaultUser).toHaveStatus("success");
        expect(respModDefaultUser.payload.email).toEqual(
            "instructor_permission_instructor_update_test@test.com"
        );
    });

    it("fetch sessions", async () => {
        await switchToInstructorOnlyUser();
        let resp = await apiGET("/instructor/sessions");
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
    });

    it("can't update session", async () => {
        await switchToInstructorOnlyUser();

        // instructors does not have permission to create a new session
        const newSession = {
            start_date: "2020-04-10T01:00:00.000Z",
            end_date: "2020-11-31T00:01:20.000Z",
            name: "instructor_permission_cant_update_session_test_session",
        };

        let resp = await apiPOST("/instructor/sessions", newSession);
        expect(resp).toHaveStatus("error");

        resp = await apiPOST("/admin/sessions", newSession);
        expect(resp).toHaveStatus("error");

        // instructors does not have permission to update an existing session
        const updatedSession = {
            id: session.id,
            start_date: "2000-04-10T01:00:00.000Z",
            end_date: "2000-11-31T00:01:20.000Z",
            name: "updated session name (should not be allowed)",
        };

        resp = await apiPOST("/instructor/sessions", updatedSession);
        expect(resp).toHaveStatus("error");

        resp = await apiPOST("/admin/sessions", updatedSession);
        expect(resp).toHaveStatus("error");

        await restoreDefaultUser();
    });

    it("fetch positions", async () => {
        await switchToInstructorOnlyUser();
        let resp = await apiGET(`/instructor/sessions/${session.id}/positions`);
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
    });

    it("can't update position", async () => {
        // instructors are not allowed to create new positions
        await switchToInstructorOnlyUser();

        const newPosition = {
            position_code:
                "instructor_permission_cant_update_position_test_code",
            position_title:
                "instructor permission cant update position test position",
            hours_per_assignment: 1.0,
            contract_template_id: existingContractTemplateId,
            duties: "Tutorials",
        };

        let resp = await apiPOST(
            `/instructor/sessions/${session.id}/positions`,
            newPosition
        );
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            newPosition
        );
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(`/admin/positions`, newPosition);
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(`/instructor/positions`, newPosition);
        expect(resp).toHaveStatus("error");

        // instructors are not allowed to update existing positions
        // first actually create the new position with an admin user
        await restoreDefaultUser();

        resp = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            newPosition
        );
        expect(resp).toHaveStatus("success");

        // fetch the newly created position's id
        resp = await apiGET(`/admin/sessions/${session.id}/positions`);
        expect(resp).toHaveStatus("success");
        const newPositionObject = resp.payload.find(
            (position) => position.position_code === newPosition.position_code
        );
        expect(newPositionObject).toBeDefined();
        const newPositionId = newPositionObject.id;

        // the instructor should not be able to update this position
        await switchToInstructorOnlyUser();

        const updatedPosition = {
            id: newPositionId,
            position_code:
                "instructor_permission_cant_update_position_test_code",
            position_title:
                "instructor permission cant update position changed title",
            hours_per_assignment: 30,
            contract_template_id: existingContractTemplateId,
            duties: "Tutorials",
        };

        resp = await apiPOST(
            `/instructor/sessions/${session.id}/positions`,
            updatedPosition
        );
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            updatedPosition
        );
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(`/admin/positions`, updatedPosition);
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(`/instructor/positions`, updatedPosition);
        expect(resp).toHaveStatus("error");

        await restoreDefaultUser();
    });

    it("fetch contract templates", async () => {
        await switchToInstructorOnlyUser();
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/contract_templates`
        );
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
    });

    it("can't update contract template", async () => {
        await switchToInstructorOnlyUser();

        const newTemplate = {
            template_file: "default-template.html",
            template_name: "Test",
        };

        // a user with only the instructor role should not be allowed to modify contract_templates
        let resp = await apiPOST(
            `/instructor/sessions/${session.id}/contract_templates`,
            newTemplate
        );
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(
            `/admin/sessions/${session.id}/contract_templates`,
            newTemplate
        );
        expect(resp).toHaveStatus("error");

        await restoreDefaultUser();
    });

    it("fetch applicants", async () => {
        await switchToInstructorOnlyUser();
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/applicants`
        );
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
    });

    it("can't update applicants", async () => {
        await switchToInstructorOnlyUser();

        const newApplicant = {
            first_name:
                "instructor_permission_test_cant_update_applicant_test_first_name",
            last_name:
                "instructor_permission_test_cant_update_applicant_test_last_name",
            email:
                "instructor_permission_test_cant_update_applicant_test@test.com",
            phone: "1111111111",
            utorid:
                "instructor_permission_test_cant_update_applicant_test_utorid",
            student_number: "1111111",
        };

        let resp = await apiPOST(
            `/instructor/sessions/${session.id}/applicants`,
            newApplicant
        );
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(
            `/admin/sessions/${session.id}/applicants`,
            newApplicant
        );
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(`/admin/applicants`, newApplicant);
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(`/instructor/applicants`, newApplicant);
        expect(resp).toHaveStatus("error");

        await restoreDefaultUser();
    });

    it("fetch assignments", async () => {
        await switchToInstructorOnlyUser();
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/applicants`
        );
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
    });

    it("can't update applications", async () => {
        await switchToInstructorOnlyUser();

        const newApplication = {
            comments: "instructor application update permission test comment",
        };

        let resp = await apiPOST(`/instructor/applications`, newApplication);
        expect(resp).toHaveStatus("error");

        resp = await apiPOST(`/admin/applications`, newApplication);
        expect(resp).toHaveStatus("error");

        await restoreDefaultUser();
    });

    it("fetch applications", async () => {
        await switchToInstructorOnlyUser();
        let resp = await apiGET(
            `/instructor/sessions/${session.id}/applications`
        );
        expect(resp).toHaveStatus("success");

        await restoreDefaultUser();
    });

    describe("Ddah permissions", () => {
        let position;
        let instructor;
        let ddah;
        
        

        beforeAll(async () => {
            // If a user is not in Instructors table, it is not considered an instructor
            // for the purpose of fetching DDAHs - so we create one
            const newInstructor = {
                first_name: "Jane",
                last_name: "Smith",
                email: "jane.smith@gmail.com",
                utorid: instructorUser.utorid,
            };
            let resp = await apiPOST(`/admin/instructors`, newInstructor);
            expect(resp).toHaveStatus("success");

            // Get newly created instructor and create a DDAH for them
            resp = await apiGET(`/admin/instructors`);
            expect(resp).toHaveStatus("success");
            instructor = resp.payload.find(
                (instructor) => instructor.utorid === instructorUser.utorid
            );
            expect(instructor).toBeDefined();
            ddah = await createDdahWithFixedDuties(instructor.id);
            
            // Fetch the position realted to the instructor
            resp = await apiGET(`/admin/sessions/${session.id}/positions`);
            position = resp.payload.find(position => position.instructor_ids.find(id => id === instructor.id));
            expect(position).toBeDefined();
        });

        it("fetch Ddahs", async () => {
            await switchToInstructorOnlyUser();
            const resp = await apiGET(
                `/instructor/sessions/${session.id}/ddahs`
            );
            expect(resp).toHaveStatus("success");
            expect(resp.payload).toHaveLength(1);
            expect(resp.payload[0]).toStrictEqual(ddah);
        });

        // Not too sure what this test should be testing,
        // I couldn't find a route for fetching DDAhs per position?
        it.todo("fetch Ddahs a position associated with self");

        it("fetch Ddahs an assignment associated with self", async () => {
            await switchToInstructorOnlyUser();
            const ddahToSearch = { assignment_id: ddah.assignment_id };
            const resp = await apiPOST(`/instructor/ddahs`, ddahToSearch);
            expect(resp).toHaveStatus("success");
            expect(resp.payload).toStrictEqual(ddah);
        });

        it("cannot fetch Ddahs for assignment not associated with self", async () => {
            // Create a new DDAH for a different instructor
            await restoreDefaultUser();
            let resp = await apiGET(`admin/instructors`);
            const millermInstructor = resp.payload.find(
                (instructor) => instructor.utorid === "millerm"
            );
            const foreignDdah = await createDdahWithFixedDuties(
                millermInstructor.id
            );

            // Assignment for that DDAH should not be accessible by our instructor
            await switchToInstructorOnlyUser();
            const ddahToSearch = { assignment_id: foreignDdah.assignment_id };
            resp = await apiPOST(`/instructor/ddahs`, ddahToSearch);
            expect(resp).toHaveStatus("error");
            expect(resp.message).toEqual(
                "Cannot create a DDAH without an assignment_id OR improper permissions to access/create a DDAH"
            );
        });

        it("create a Ddah for an assignment associated with self", async () => {
            // Create another assignment (with no DDAH)
            // for position associated with the instructor
            await restoreDefaultUser();
            
            console.log(position);
            console.log(instructor.id);
            const newAssignment = {
                note: "",
                applicant_id: databaseSeeder.seededData.applicant.id,
                position_id: position.id,
                start_date: "2019-09-02T00:00:00.000Z",
                end_date: "2019-12-31T00:00:00.000Z",
            };
            let resp = await apiPOST("/admin/assignments", newAssignment);
            console.log(resp);
            expect(resp).toHaveStatus("success");
            const emptyAssignment = resp.payload;

            await switchToInstructorOnlyUser();
            const ddahToCreate = {
                assignment_id: emptyAssignment.id,
                duties: [
                    {
                        order: 1,
                        hours: 20,
                        description: "workshops:Facilitating workshops",
                    },
                    {
                        order: 2,
                        hours: 50,
                        description: "lectures:Lecture support",
                    },
                ],
            };
            // WHY DOES THIS FAIL?
            resp = await apiPOST(`/instructor/ddahs`, ddahToCreate);
            expect(resp).toHaveStatus("success");
            expect(resp.payload).toStrictEqual(ddahToCreate);
            resp = await apiGET(
                `/instructor/sessions/${session.id}/ddahs`
            );
            expect(resp).toHaveStatus("success");
            expect(resp.payload).toHaveLength(2);
        });

        it.todo("update a Ddah for an assignment associated with self");
        it.todo(
            "cannot set approved_date/accepted_date/revised_date/emailed_date/signature for a Ddah associated with self"
        );
        it.todo(
            "cannot create a Ddah for an assignment not associated with self"
        );
        it.todo(
            "cannot update a Ddah for an assignment not associated with self"
        );
    });
}
