import {
    it,
    beforeAll,
    expect,
    checkPropTypes,
    postingPropTypes,
} from "./utils";
import { databaseSeeder } from "./setup";

export function applicationsTests({ apiGET, apiPOST }) {
    let session;
    let position;
    let posting = {};
    let adminUser;
    let surveyData;

    const taOnlyUser = {
        utorid: "matthewc",
        roles: ["ta"],
    };

    const postingData = {
        name: "2021 Summer Posting",
        intro_text: "Intro text for posting",
        open_date: new Date("2021/05/01").toISOString(),
        close_date: new Date("2021/08/31").toISOString(),
        availability: "auto",
    };

    // These tests set data through the `/public/postings` route,
    // but read data through the `/api/v1/admin` route.
    describe("Public route tests", () => {
        beforeAll(async () => {
            await databaseSeeder.seed({ apiGET, apiPOST });
            session = databaseSeeder.seededData.session;
            position = databaseSeeder.seededData.position;
            let resp = await apiGET(`/debug/active_user`);
            expect(resp).toHaveStatus("success");
            adminUser = resp.payload;
        });

        it.todo("Get survey.js posting data through public route");
        it.todo(
            "Survey.js posting data is pre-filled based on prior applicant/application data"
        );

        it("Can submit survey.js data via the public postings route", async () => {
            // Create a new posting
            let resp = await apiPOST(
                `/admin/sessions/${session.id}/postings`,
                postingData
            );
            expect(resp).toHaveStatus("success");
            Object.assign(posting, resp.payload);
            checkPropTypes(postingPropTypes, posting);
            expect(posting.id).not.toBeNull();

            // Set position for posting
            resp = await apiPOST(
                `/admin/postings/${posting.id}/posting_positions`,
                { position_id: position.id }
            );
            expect(resp).toHaveStatus("success");

            // Create and switch to a ta only user
            resp = await apiPOST("/debug/users", taOnlyUser);
            expect(resp).toHaveStatus("success");
            resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

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
                `/public/postings/${posting.url_token}/submit`,
                surveyData,
                true
            );
            expect(resp).toHaveStatus("success");

            // Switch back to default admin
            resp = await apiPOST("/debug/active_user", adminUser);
            expect(resp).toHaveStatus("success");

            // Further verfication will happen in test cases concerning application data
        });

        it.todo(
            "When submitting survey.js data an applicant and application are automatically created they don't exist"
        );
        it.todo(
            "When submitting survey.js data an applicant and application are updated if they already exist"
        );
        it.todo(
            "Even if a different utorid is submitted via survey.js data the active_user's utorid is used"
        );
        it.skip("When submitting survey.js data cannot add a position_preference for a position not listed in the posting", async () => {
            // Add illegal position's preference
            surveyData.answers.position_preferences = {
                ...surveyData.answers.position_preferences,
                MAT102: 3,
            };

            // Switch to a ta only user
            let resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            // Submit survey.js data
            resp = await apiPOST(
                `/public/postings/${posting.url_token}/submit`,
                surveyData,
                true
            );
            expect(resp).toHaveStatus("error");

            // Switch back to default admin
            resp = await apiPOST("/debug/active_user", adminUser);
            expect(resp).toHaveStatus("success");
        });
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
}
