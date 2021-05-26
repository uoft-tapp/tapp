import { it, beforeAll, expect } from "./utils";
import { databaseSeeder } from "./setup";

export function applicationsTests({ apiGET, apiPOST }) {
    beforeAll(async () => {
        await databaseSeeder.seed({ apiGET, apiPOST });
    }, 30000);

    // These tests set data through the `/public/postings` route,
    // but read data through the `/api/v1/admin` route.
    describe("Public route tests", () => {
        beforeAll(async () => {
            await databaseSeeder.seed({ apiGET, apiPOST });
            session = databaseSeeder.seededData.session;
        }, 30000);

        const survey = {
            name: "CSC494F TA",
            intro_text: "TA posting for CSC494F",
            open_date: "2021/01/01",
            close_date: "2021/05/01",
            availability: "auto",
            custom_questions: {
                pages: [
                    {
                        name: "page1",
                        elements: [
                            {
                                type: "text",
                                name: "question1",
                                answer: "answer1"
                            },
                            {
                                type: "text",
                                name: "question2",
                                answer: "answer2"
                            },
                        ],
                    },
                    {
                        name: "page2",
                        elements: [
                            {
                                type: "text",
                                name: "question3",
                                answer: "answer3"
                            },
                            {
                                type: "text",
                                name: "question4",
                                answer: "answer4"
                            },
                        ],
                    },
                ],
            },
        };


        it.todo("Get survey.js posting data through public route");

        it.todo(
            "Survey.js posting data is pre-filled based on prior applicant/application data"
        );

        // Route: POST '/public/postings/' 
        it("Can submit survey.js data via the public postings route", async () => {
            let resp = await apiPOST(`/public/postings/${token}/submit`, {
                ...survey, 
                session_id: session.id
            })

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
