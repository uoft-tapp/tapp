import {
    it,
    beforeAll,
    checkPropTypes,
    postingPropTypes,
    surveyPropTypes,
    expect,
} from "./utils";
import { databaseSeeder } from "./setup";

export function applicationsTests({ apiGET, apiPOST }) {
    let session, surveyPrefill, applicant, position;
    let defaultUser;
    let resp;
    const HIGH_PREFERENCE = 3;

    const posting = {
        name: "CSC209F TA",
        intro_text: "Testing posting for CSC209F",
        open_date: "2021/04/01",
        close_date: "2021/05/01",
        availability: "open",
    };

    const postingPosition = {
        num_positions: 10,
        hours: 68,
    };

    const newUser = {
        roles: ["ta"],
        utorid: "greenb",
    };

    beforeAll(async () => {
        await databaseSeeder.seed({ apiGET, apiPOST });
        session = databaseSeeder.seededData.session;
        applicant = databaseSeeder.seededData.applicant;
        position = databaseSeeder.seededData.position;

        // get the current active user
        let resp = await apiGET("/debug/active_user");
        expect(resp).toHaveStatus("success");
        defaultUser = resp.payload;
    }, 30000);

    // These tests set data through the `/public/postings` route,
    // but read data through the `/api/v1/admin` route.
    describe("Public route tests", () => {
        it("Get survey.js posting data through public route", async () => {
            // make sure the user has admin permissions before this post request
            // make a new posting and update <posting> to include the id of the posting
            resp = await apiPOST("/admin/postings", {
                ...posting,
                session_id: session.id,
            });
            expect(resp).toHaveStatus("success");
            checkPropTypes(postingPropTypes, resp.payload);
            expect(resp.payload.id).not.toBeNull();
            Object.assign(posting, resp.payload);

            // make sure the user is the seeded applicant before this get request for the purposes of the next test
            // create a user for the applicant to make sure they exist before changing the default user to applicant
            const applicantAsUser = {
                roles: ["ta"],
            };
            applicantAsUser.utorid = applicant.utorid;

            resp = await apiPOST("/debug/users", applicantAsUser);
            expect(resp).toHaveStatus("success");
            Object.assign(applicantAsUser, resp.payload);

            // set the default user to the applicant
            resp = await apiPOST("/debug/active_user", applicantAsUser);
            expect(resp).toHaveStatus("success");

            // read survey.js posting data
            resp = await apiGET(`/public/postings/${posting.url_token}`, true);
            expect(resp).toHaveStatus("success");
            checkPropTypes(surveyPropTypes, resp.payload);
            surveyPrefill = resp.payload["prefilled_data"];

            // restore the default user
            resp = await apiPOST("/debug/active_user", defaultUser);
            expect(resp).toHaveStatus("success");
        });

        // broken up into 2 tests: applicant & application(not yet implemented in the backend)
        it("Survey.js posting data is pre-filled based on prior applicant", async () => {
            // this test depends on the previous test on the terms of surveyPrefill variable
            const prefilled = [
                "utorid",
                "student_number",
                "first_name",
                "last_name",
                "email",
                "phone",
            ];
            for (let prefilledKey of prefilled) {
                // check if every applicant information is in the prefilled data
                expect(surveyPrefill[prefilledKey]).toBeDefined();

                // check if the applicant prefill information is correct
                expect(surveyPrefill[prefilledKey]).toEqual(
                    applicant[prefilledKey]
                );
            }
        });

        it.todo(
            "Survey.js posting data is pre-filled based on prior application"
        );

        it.todo("Can submit survey.js data via the public postings route");

        it("When submitting survey.js data an applicant and application are automatically created they don't exist", async () => {
            // link seeded position to the posting (todo: remove after merged with previous test)
            resp = await apiPOST(
                `/admin/postings/${posting.id}/posting_positions`,
                { ...postingPosition, position_id: position.id }
            );
            expect(resp).toHaveStatus("success");
            Object.assign(postingPosition, resp.payload);

            // create a new user (ensures that the applicant and application don't exist)
            resp = await apiPOST("/debug/users", newUser);
            expect(resp).toHaveStatus("success");
            Object.assign(newUser, resp.payload);

            //check if new user is successfully created
            resp = await apiGET("/debug/users");
            expect(resp).toHaveStatus("success");
            const foundUser = resp.payload.find(
                (user) => user.utorid === newUser.utorid
            );
            expect(foundUser).toBeDefined();

            // switch to the new user
            resp = await apiPOST("/debug/active_user", newUser);
            expect(resp).toHaveStatus("success");

            // submit an application to the posting
            // assume posting submission is tested (previous test)
            const surveyjsSubmission = {
                answers: {
                    utorid: "johnd",
                    first_name: "John",
                    last_name: "D",
                    email: "testemail@utoronto.ca",
                    phone: "6471111111",
                    student_number: "1002345678",
                    position_preferences: {
                        [position.position_code]: HIGH_PREFERENCE,
                    },
                },
            };
            resp = await apiPOST(
                `/public/postings/${posting.url_token}/submit`,
                surveyjsSubmission,
                true
            );

            // switch back to default (i.e. with admin role) user
            resp = await apiPOST("/debug/active_user", defaultUser);
            expect(resp).toHaveStatus("success");

            // todo: check db if new applicant and application has been created
        });

        it.todo(
            "When submitting survey.js data an applicant and application are updated if they already exist"
        );
        it.todo(
            "Even if a different utorid is submitted via survey.js data the active_user's utorid is used"
        );
        it.todo(
            "When submitting survey.js data cannot add a position_preference for a position not listed in the posting"
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
