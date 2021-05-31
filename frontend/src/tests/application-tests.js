import { it, beforeAll, expect, checkPropTypes, postingPropTypes } from "./utils";
import { databaseSeeder } from "./setup";

export function applicationsTests({ apiGET, apiPOST }) {
    let session;
    let posting = {};
    let resp = {};
    let position;
    let contractTemplate;

    const postingData = {
        name: "2021 Summer Posting",
        intro_text: "Intro text for posting",
        open_date: new Date("2021/05/01").toISOString(),
        close_date:  new Date("2021/08/31").toISOString(),
        availability: "auto",
    };

    const postingPos = {
        hours: 20,
        num_positions: 1,
    };

    // These tests set data through the `/public/postings` route,
    // but read data through the `/api/v1/admin` route.
    describe("Public route tests", () => {

        beforeAll(async () => {
            await databaseSeeder.seed({ apiGET, apiPOST });
            session = databaseSeeder.seededData.session;
            position = databaseSeeder.seededData.position;
            contractTemplate = databaseSeeder.seededData.contractTemplate;
            console.log(session)
            console.log(position)
            console.log(contractTemplate)
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
            console.log(resp.payload)
            console.log(posting)
            expect(resp).toHaveStatus("success");
            Object.assign(posting, resp.payload);
            checkPropTypes(postingPropTypes, posting);

            expect(posting.id).not.toBeNull();

            //Set position for posting
            resp = await apiPOST(
                `/admin/postings/${posting.id}/posting_positions`,
                { ...postingPos, position_id: position.id }
            );
            expect(resp).toHaveStatus("success");
            Object.assign(postingPos, resp.payload);
            
            //Create and submit survey.js data
            const position_code = position.position_code;
            const surveyData = {
                "utorid": "smithh",
                "student_number": "1111111111",
                "first_name": "jin",
                "last_name": "chun",
                "email": "test@test.ca",
                "phone": "1111111111",
                "program": "M",
                "program_start": "2021-05-21",
                "department": "cs",
                "previous_university_ta": true,
                "previous_department_ta": true,
                "previous_other_university_ta": false,
                "previous_experience_summary": "n/a",
                "position_preferences": {
                  [position_code]: 3,
                },
                "comments": "n/a"
            }
            console.log(surveyData)
            //Submit survey.js data
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
