import {
    it,
    beforeAll,
    checkPropTypes,
    postingPropTypes,
    surveyPropTypes,
    expect,
} from "./utils";
import { databaseSeeder } from "./setup";

const HIGH_PREFERENCE = 3;
const LOW_PREFERENCE = 1;

export function applicationsTests({ apiGET, apiPOST }) {
    let session, applicant, position; // retrieved from seeder
    let adminUser;
    let surveyData;
    const userCreatedFromApplicant = {};
    const postingData = {
        name: "CSC209F TA",
        intro_text: "Testing posting for CSC209F",
        open_date: "2021/04/01",
        close_date: "2021/05/01",
        availability: "open",
    };

    // PP => Position Preference
    const postingDataForPPTests = {
        name: "CSC343F TA",
        intro_text: "Testing posting for CSC343F",
        open_date: "2021/04/01",
        close_date: "2021/05/01",
        availability: "open",
    };

    const postingPosition = {
        num_positions: 10,
        hours: 68,
    };

    const userWithTaPermissions = {
        roles: ["ta"],
        utorid: "greenb",
    };

    /**
     * Switches the current active user to the user given
     * This function uses debug route to achieve user switching.
     *
     * @param user user to switch to in the debug route
     * @returns {Promise<void>}
     */
    async function switchToUser(user) {
        let resp = await apiPOST(`/debug/active_user`, user);
        expect(resp).toHaveStatus("success");
    }

    /**
     * Restores the active user to the default user (the user logged during test setup in beforeAll).
     *
     * @returns {Promise<void>}
     */
    async function restoreDefaultUser() {
        let respSwitchBackUser = await apiPOST(`/debug/active_user`, adminUser);
        expect(respSwitchBackUser).toHaveStatus("success");
    }

    /**
     * Add a new posting (requires active_user to have admin permissions)
     * @param postingData posting to be added
     * @param {{id: number}} session session to add to (must have an `id` attribute)
     * @returns
     */
    async function addPosting(postingData, session) {
        const posting = {
            ...postingData,
            session_id: session.id,
        };
        let resp = await apiPOST("/admin/postings", posting);
        expect(resp).toHaveStatus("success");
        return resp.payload;
    }

    beforeAll(async () => {
        await databaseSeeder.seed({ apiGET, apiPOST });
        session = databaseSeeder.seededData.session;
        applicant = databaseSeeder.seededData.applicant;
        position = databaseSeeder.seededData.position;

        // Get the current active user
        let resp = await apiGET("/debug/active_user");
        expect(resp).toHaveStatus("success");
        adminUser = resp.payload;

        // Making sure the user is the seeded applicant before this get request for the purposes of the next test
        // Created a user for the applicant to make sure they exist before changing the default user to applicant
        Object.assign(userCreatedFromApplicant, {
            utorid: applicant.utorid,
            roles: ["ta"],
        });

        resp = await apiPOST("/debug/users", userCreatedFromApplicant);
        expect(resp).toHaveStatus("success");
        Object.assign(userCreatedFromApplicant, resp.payload);

        // Create a new user with TA permissions
        resp = await apiPOST("/debug/users", userWithTaPermissions);
        expect(resp).toHaveStatus("success");
        Object.assign(userWithTaPermissions, resp.payload);

        // Create a new posting for PP tests
        const respPostingData = await addPosting(
            postingDataForPPTests,
            session
        );
        Object.assign(postingDataForPPTests, respPostingData);
    }, 30000);

    // These tests set data through the `/public/postings` route,
    // but read data through the `/api/v1/admin` route.
    describe("Public route tests", () => {
        it("Get survey.js posting data through public route", async () => {
            // Make sure the user has admin permissions before this post request
            // Make a new posting and update <posting> to include the id of the posting
            const respPostingData = await addPosting(postingData, session);
            checkPropTypes(postingPropTypes, respPostingData);
            expect(respPostingData.id).not.toBeNull();
            Object.assign(postingData, respPostingData);

            await switchToUser(userCreatedFromApplicant);

            // Read survey.js posting data
            let resp = await apiGET(
                `/public/postings/${postingData.url_token}`,
                true
            );
            expect(resp).toHaveStatus("success");
            checkPropTypes(surveyPropTypes, resp.payload);

            await restoreDefaultUser();
        });

        it("Survey.js posting data is pre-filled based on prior applicant", async () => {
            await switchToUser(userCreatedFromApplicant);

            // Read survey.js posting data
            let resp = await apiGET(
                `/public/postings/${postingData.url_token}`,
                true
            );
            expect(resp).toHaveStatus("success");
            checkPropTypes(surveyPropTypes, resp.payload);
            const surveyPrefill = resp.payload.prefilled_data;

            for (const prefilledKey of [
                "utorid",
                "student_number",
                "first_name",
                "last_name",
                "email",
                "phone",
            ]) {
                // Check if the applicant prefill information is correct
                expect(surveyPrefill[prefilledKey]).toEqual(
                    applicant[prefilledKey]
                );
            }
            await restoreDefaultUser();
        });

        it("Can submit survey.js data via the public postings route", async () => {
            // Create a new posting
            let resp = await apiPOST(
                `/admin/sessions/${session.id}/postings`,
                postingData
            );
            expect(resp).toHaveStatus("success");
            Object.assign(postingData, resp.payload);
            checkPropTypes(postingPropTypes, postingData);
            expect(postingData.id).not.toBeNull();

            // Set position for posting
            resp = await apiPOST(
                `/admin/postings/${postingData.id}/posting_positions`,
                { position_id: position.id }
            );
            expect(resp).toHaveStatus("success");
            Object.assign(postingPosition, resp.payload);

            const taOnlyUser = {
                utorid: "matthewc",
                roles: ["ta"],
            };

            // Create and switch to a ta only user
            resp = await apiPOST("/debug/users", taOnlyUser);
            expect(resp).toHaveStatus("success");
            await switchToUser(taOnlyUser);

            // Create and submit survey.js data
            surveyData = {
                answers: {
                    utorid: "matthewc",
                    student_number: "1000123456",
                    first_name: "Matthew",
                    last_name: "Cambell",
                    email: "test@test.ca",
                    phone: "6471234567",
                    program: "M",
                    program_start: "2017-09-05",
                    department: "cs",
                    previous_university_ta: true,
                    some_entry: false,
                    previous_department_ta: true,
                    previous_other_university_ta: false,
                    previous_experience_summary: "some previous experience",
                    position_preferences: {
                        [position.position_code]: 3,
                    },
                    comments: "some additional comments",
                },
            };

            // Submit survey.js data
            resp = await apiPOST(
                `/public/postings/${postingData.url_token}/submit`,
                surveyData,
                true
            );
            expect(resp).toHaveStatus("success");

            // Switch back to default admin
            resp = await apiPOST("/debug/active_user", adminUser);
            expect(resp).toHaveStatus("success");

            await restoreDefaultUser();

            // Further verfication will happen in test cases concerning application data
        });

        it.skip("Survey.js posting data is pre-filled based on prior application", async () => {
            // Submit an application to the posting
            const application = {
                ...applicant,
                program: "P",
                program_start: "2021-06-21",
                department: "cs",
                previous_university_ta: false,
                previous_department_ta: false,
                previous_other_university_ta: false,
                comments: "My comments",
            };

            let resp = await apiPOST(
                `/public/postings/${postingData.url_token}/submit`,
                application,
                true
            );
            expect(resp).toHaveStatus("success");
            const submittedData = resp.payload;

            const applicationPrefillData = {
                program: submittedData.program,
                department: submittedData.department,
                yip: submittedData.yip,
                previous_department_ta: submittedData.previous_department_ta,
                previous_university_ta: submittedData.previous_university_ta,
                previous_experience_summary:
                    submittedData.previous_experience_summary,
                gpa: submittedData.gpa,
                comments: submittedData.comments,
            };

            await switchToUser(userCreatedFromApplicant);

            // Read survey.js posting data
            resp = await apiGET(
                `/public/postings/${postingData.url_token}`,
                true
            );
            expect(resp).toHaveStatus("success");
            checkPropTypes(surveyPropTypes, resp.payload);
            expect(resp.payload["prefilled_data"]).toEqual(
                expect.objectContaining(applicationPrefillData)
            );
            await restoreDefaultUser();
        });

        it(
            "When submitting survey.js data cannot add a position_preference for a position not listed in the" +
                " posting",
            async () => {
                // Submit a position preference for a position_code that isn't
                // associated with the current application
                await switchToUser(userCreatedFromApplicant);

                // PP ==> Position Preference
                const applicationExistentPP = {
                    answers: {
                        ...applicant,
                        position_preferences: {
                            // position that already exists but isn't associated
                            // with the current application
                            [position.position_code]: HIGH_PREFERENCE,
                        },
                    },
                };

                let resp = await apiPOST(
                    `/public/postings/${postingDataForPPTests.url_token}/submit`,
                    applicationExistentPP,
                    true
                );
                expect(resp).toHaveStatus("error");

                const applicationNonExistentPP = {
                    answers: {
                        ...applicant,
                        position_preferences: {
                            // position that already exists but isn't associated
                            // with the current application
                            DNE101: HIGH_PREFERENCE,
                        },
                    },
                };

                resp = await apiPOST(
                    `/public/postings/${postingDataForPPTests.url_token}/submit`,
                    applicationNonExistentPP,
                    true
                );
                expect(resp).toHaveStatus("error");

                await restoreDefaultUser();
            }
        );

        it("Submitting an application with incorrect position_preferences type results in error", async () => {
            // Link seeded position to the new posting
            const postingPosition = {
                num_positions: 10,
                hours: 68,
            };
            let resp = await apiPOST(
                `/admin/postings/${postingDataForPPTests.id}/posting_positions`,
                { ...postingPosition, position_id: position.id }
            );
            expect(resp).toHaveStatus("success");
            Object.assign(postingPosition, resp.payload);

            await switchToUser(userCreatedFromApplicant);

            // Submit an application with incorrect position_preferences type (supposed to be an object)
            const applicationWithIncorrectPPType = {
                answers: {
                    ...applicant,
                    position_preferences: 5,
                },
            };
            resp = await apiPOST(
                `/public/postings/${postingDataForPPTests.url_token}/submit`,
                applicationWithIncorrectPPType,
                true
            );
            expect(resp).toHaveStatus("error");

            await restoreDefaultUser();
        });

        it("Cannot submit an application without the answers", async () => {
            await switchToUser(userCreatedFromApplicant);

            // Submit an empty object
            let resp = await apiPOST(
                `/public/postings/${postingDataForPPTests.url_token}/submit`,
                {},
                true
            );
            expect(resp).toHaveStatus("error");

            // all the data is in the original object and not in the <answers> prop
            const noAnswersApplication = {
                ...applicant,
                position_preferences: {
                    [position.position_code]: HIGH_PREFERENCE,
                },
            };
            resp = await apiPOST(
                `/public/postings/${postingDataForPPTests.url_token}/submit`,
                noAnswersApplication,
                true
            );
            expect(resp).toHaveStatus("error");

            await restoreDefaultUser();
        });

        it(
            "When submitting survey.js data an applicant and application are automatically created if they don't" +
                " exist and they are updated if they already exist",
            async () => {
                await restoreDefaultUser();

                // Ensure that the new user is not an applicant
                let resp = await apiGET("/admin/applicants");
                const applicant = resp.payload.find(
                    (applicant) =>
                        applicant.utorid === userWithTaPermissions.utorid
                );
                expect(applicant).not.toBeDefined();

                await switchToUser(userWithTaPermissions);

                // Submit an application to the posting, assuming application submission is tested
                const firstApplication = {
                    answers: {
                        utorid: "greenb",
                        first_name: "Green",
                        last_name: "Bee",
                        email: "testemail@utoronto.ca",
                        phone: "6471111111",
                        student_number: "1002345678",
                        position_preferences: {
                            [position.position_code]: HIGH_PREFERENCE,
                        },
                    },
                };
                resp = await apiPOST(
                    `/public/postings/${postingData.url_token}/submit`,
                    firstApplication,
                    true
                );
                expect(resp).toHaveStatus("success");

                await restoreDefaultUser();

                // Check db if new applicant and application has been created
                resp = await apiGET("/admin/applicants");
                const newApplicant = resp.payload.find(
                    (applicant) =>
                        applicant.utorid === userWithTaPermissions.utorid
                );
                expect(newApplicant).toBeDefined();

                resp = await apiGET(
                    `/admin/sessions/${session.id}/applications`
                );

                // Assumes that the applicant and posting are primary keys for an application
                const newApplication = resp.payload.find(
                    (application) =>
                        application.applicant_id === newApplicant.id &&
                        application.posting_id === postingData.id
                );
                expect(newApplication).toBeDefined();

                await switchToUser(userWithTaPermissions);

                // From this point, "new" keyword refers to the information that we are manually updating and
                // "updated" keyword refers to information we have received after resubmission of the application and
                // expect them to be "updated"

                // Submit an updated application to the posting
                const newFirstName = "Not Green";
                const newPositionPreference = [
                    {
                        position_id: position.id,
                        preference_level: LOW_PREFERENCE,
                    },
                ];

                const surveyjsSubmission = {
                    answers: {
                        first_name: newFirstName,
                        position_preferences: {
                            [position.position_code]:
                                newPositionPreference[0].preference_level,
                        },
                    },
                };
                resp = await apiPOST(
                    `/public/postings/${postingData.url_token}/submit`,
                    surveyjsSubmission,
                    true
                );
                expect(resp).toHaveStatus("success");

                await restoreDefaultUser();

                // Check db if the applicant information has been updated
                resp = await apiGET("/admin/applicants");
                expect(resp).toHaveStatus("success");

                const updatedApplicant = resp.payload.find(
                    (applicant) =>
                        applicant.utorid === userWithTaPermissions.utorid
                );
                expect(updatedApplicant).toBeDefined();

                const {
                    first_name: updatedFirstName,
                    ...otherApplicantFields
                } = updatedApplicant;

                expect(newFirstName).toEqual(updatedFirstName);
                expect(newApplicant).toMatchObject(
                    expect.objectContaining(otherApplicantFields)
                );

                // Check db if the application has been updated
                resp = await apiGET(
                    `/admin/sessions/${session.id}/applications`
                );

                // Assumes that the applicant and posting are primary keys for an application
                const updatedApplication = resp.payload.find(
                    (application) =>
                        application.applicant_id === updatedApplicant.id &&
                        application.posting_id === postingData.id
                );
                const {
                    position_preferences: updatedPositionPreferences,
                    // ...otherApplicationFields // see issue #629
                } = updatedApplication;
                expect(newPositionPreference).toEqual(
                    updatedPositionPreferences
                );
                // See issue #629
                // expect(newApplication).toMatchObject(
                //     expect.objectContaining(otherApplicationFields)
                // );
            }
        );
        it.todo(
            "Even if a different utorid is submitted via survey.js data the active_user's utorid is used"
        );
        it.todo(
            "When submitting survey.js data attached files are stored on disk rather than as base64 strings in the database"
        );
        it.todo(
            "Can submit a jpg/png file as a 'transcript' for an application; the resulting file can be retrieved"
        );
        it.todo(
            "Can submit a pdf file as a 'transcript' for an application; the resulting file can be retrieved"
        );
        it.todo(
            "Can submit and retrieve multiple files as a 'transcript' for an application"
        );
        // This is to test for a possible regression related to https://github.com/rails/rails/issues/41903
        it.todo("Can submit and retrieve attachments for a new application");
        it.todo(
            "Can submit and retrieve attachments for an updated application"
        );
    });

    describe("Admin route tests", () => {
        it.todo("Create an application");
        it.todo("Update an application");
    });
}
