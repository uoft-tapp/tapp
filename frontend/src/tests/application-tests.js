import { it, beforeAll, expect, checkPropTypes, postingPropTypes } from "./utils";
import { databaseSeeder } from "./setup";

export function applicationsTests({ apiGET, apiPOST }) {
    let session;
    let posting;
    let resp;

    const postingData = {
        name: "2021 Summer Posting",
        intro_text: "Intro text for posting",
        open_date: new Date("2021/05/01").toISOString(),
        // open_date: "2021/05/01"
        close_date:  new Date("2021/08/31").toISOString(),
        // close_date: "2021/08/31"
        availability: "auto",
    };

    const surveyData = {
        "utorid": "defaultactive",
        "first_name": "Albus",
        "last_name": "Dumbledore",
        "email": "test@test.ca",
        "phone": "1234567890",
        "student_number": "1234567890",
        "program": "other",
        "program-Comment": "somerole",
        "program_start": "2021-01-01",
        "department": "cs",
        "previous_university_ta": true,
        "previous_department_ta": false,
        "previous_other_university_ta": false,
        "previous_experience_summary": "n/a",
        "position_preferences": 3,
        "comments": "some additional comments"
    };


    // These tests set data through the `/public/postings` route,
    // but read data through the `/api/v1/admin` route.
    describe("Public route tests", () => {

        beforeAll(async () => {
            await databaseSeeder.seed({ apiGET, apiPOST });
            session = databaseSeeder.seededData.session;
        });
    
        it.todo("Get survey.js posting data through public route");
        it.todo(
            "Survey.js posting data is pre-filled based on prior applicant/application data"
        );

        // TODO 
        it("Can submit survey.js data via the public postings route", async () => {
            resp = await apiPOST(
                `/admin/sessions/${session.id}/postings`,
                postingData
            );
            expect(resp).toHaveStatus("success");
            checkPropTypes(postingPropTypes, resp.payload);
            expect(resp.payload.id).not.toBeNull();
            Object.assign(posting, resp.payload);

            resp = await apiPOST(`/public/postings/${posting.url_token}/submit`, surveyData)
            expect(resp).toHaveStatus("success");
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
