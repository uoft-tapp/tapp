import {
    it,
    beforeAll,
    expect,
    checkPropTypes,
    postingPropTypes,
} from "./utils";
import { databaseSeeder } from "./setup";
import axios from "axios";
import fs from "fs";
import path from "path";
import md5 from "md5";

export function applicationsTests({ apiGET, apiPOST }) {
    let session;
    let position;
    let posting = {};
    let adminUser;

    const BACKEND_BASE_URL = "http://backend:3000";

    // Returns hashes rather than expecting their equality as possible fail is untracable back to the test case 
    async function getMD5Hashes(url_token, file_type) {
        let content_type;
        switch (file_type) {
            case "txt":
                content_type = "text/plain";
            case "pdf":
                content_type = "application/pdf";
            case "jpg":
                content_type = "image/jpeg";
        }

        let resp = await axios.get(
            `${BACKEND_BASE_URL}/public/files/${url_token}`,
            {
                responseType: "arraybuffer",
                headers: {
                    "Content-Type": content_type,
                },
            }
        );
        let retrievedData = new Uint8Array(resp.data);
        let originalData = fs.readFileSync(
            path.resolve(__dirname, `./image-data/dummy.${file_type}`)
        );
        return [md5(retrievedData), md5(originalData)]
    }

    let surveyWithoutTranscript = {
        answers: {
            utorid: "smithh",
            first_name: "matthew",
            last_name: "chun",
            email: "wef@test.ca",
            phone: "6472222222",
            student_number: "10000000",
            program: "U",
            program_start: "2021-07-01",
            department: "cs",
            previous_university_ta: false,
            previous_department_ta: true,
            previous_other_university_ta: false,
            previous_experience_summary: "n/a",
            comments: "n/a",
        },
    };

    const taOnlyUser = {
        utorid: "matthewc",
        roles: ["ta"],
    };

    let postingData = {
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
            // Create taonlyuser
            resp = await apiPOST("/debug/users", taOnlyUser);
            expect(resp).toHaveStatus("success");

            surveyWithoutTranscript.answers.position_preferences = {
                [position.position_code]: 3,
            };
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

            // Switch to a ta only user
            resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            // Submit survey.js data
            resp = await apiPOST(
                `/public/postings/${posting.url_token}/submit`,
                surveyWithoutTranscript,
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
            let illegalSurvey = {
                ...surveyWithoutTranscript,
            };
            illegalSurvey.answers.position_preferences = {
                ...surveyWithoutTranscript.answers.position_preferences,
                MAT102: 3,
            };

            // Switch to a ta only user
            let resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            // Submit survey.js data
            resp = await apiPOST(
                `/public/postings/${posting.url_token}/submit`,
                illegalSurvey,
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
        it("Can submit and retrieve attachments for a new application", async () => {
            let resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            let str = fs.readFileSync(
                path.resolve(__dirname, "./image-data/dummy.txt"),
                {
                    encoding: "base64",
                }
            );
            let txt_str = "data:text/plain;base64," + str;
            
            // Attach text file
            let surveyWithTranscript = {
                ...surveyWithoutTranscript,
            };
            surveyWithTranscript.answers.transcripts = [
                {
                    name: "dummy.txt",
                    type: "text/plain",
                    content: txt_str,
                },
            ];

            resp = await apiPOST(
                `/public/postings/${posting.url_token}/submit`,
                surveyWithTranscript,
                true
            );
            expect(resp).toHaveStatus("success");

            resp = await apiPOST("/debug/active_user", adminUser);
            expect(resp).toHaveStatus("success");

            resp = await apiGET(`/admin/sessions/${session.id}/applications`);
            let url_token = resp.payload[0].documents[0].url_token;

            resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            let hashes = getMD5Hashes(url_token, "txt");
            expect(hashes[0]).toEqual(hashes[1])
        });

        it.todo(
            "Can submit and retrieve attachments for an updated application"
        );

        it("Can submit a jpg/png file as a 'transcript' for an application; the resulting file can be retrieved", async () => {
            let resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            let str = fs.readFileSync(
                path.resolve(__dirname, "./image-data/dummy.jpg"),
                {
                    encoding: "base64",
                }
            );
            let jpg_str = "data:image/jpeg;base64," + str;

            let surveyWithTranscript = {
                ...surveyWithoutTranscript,
            };

            // Attach jpg file
            surveyWithTranscript.answers.transcripts = [
                {
                    name: "dummy.jpg",
                    type: "image/jpeg",
                    content: jpg_str,
                },
            ];

            resp = await apiPOST(
                `/public/postings/${posting.url_token}/submit`,
                surveyWithTranscript,
                true
            );
            expect(resp).toHaveStatus("success");

            resp = await apiPOST("/debug/active_user", adminUser);
            expect(resp).toHaveStatus("success");

            resp = await apiGET(`/admin/sessions/${session.id}/applications`);
            let url_token = resp.payload[0].documents[0].url_token;

            resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            let hashes = getMD5Hashes(url_token, "jpg");
            expect(hashes[0]).toEqual(hashes[1])
        });

        it("Can submit a pdf file as a 'transcript' for an application; the resulting file can be retrieved", async () => {
            let resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            let str = fs.readFileSync(
                path.resolve(__dirname, "./image-data/dummy.pdf"),
                {
                    encoding: "base64",
                }
            );
            let content_str = "data:application/pdf;base64," + str;

            let surveyWithTranscript = {
                ...surveyWithoutTranscript,
            };

            // Attach pdf file
            surveyWithTranscript.answers.transcripts = [
                {
                    name: "dummy.pdf",
                    type: "application/pdf",
                    content: content_str,
                },
            ];

            resp = await apiPOST(
                `/public/postings/${posting.url_token}/submit`,
                surveyWithTranscript,
                true
            );
            expect(resp).toHaveStatus("success");

            resp = await apiPOST("/debug/active_user", adminUser);
            expect(resp).toHaveStatus("success");

            resp = await apiGET(`/admin/sessions/${session.id}/applications`);
            let url_token = resp.payload[0].documents[0].url_token;

            let hashes = getMD5Hashes(url_token, "pdf");
            expect(hashes[0]).toEqual(hashes[1])
        });

        it("Can submit and retrieve multiple files as a 'transcript' for an application", async () => {
            let resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            let pdf_str = fs.readFileSync(
                path.resolve(__dirname, "./image-data/dummy.pdf"),
                {
                    encoding: "base64",
                }
            );
            let contentPDF = "data:application/pdf;base64," + pdf_str;

            let jpg_str = fs.readFileSync(
                path.resolve(__dirname, "./image-data/dummy.jpg"),
                {
                    encoding: "base64",
                }
            );
            let contentJPG = "data:image/jpeg;base64," + jpg_str;

            let surveyWithTranscript = {
                ...surveyWithoutTranscript,
            };

            // Attach multiple transcript files 
            surveyWithTranscript.answers.transcripts = [
                {
                    name: "dummy.pdf",
                    type: "application/pdf",
                    content: contentPDF,
                },
                {
                    name: "dummy.jpg",
                    type: "image/jpeg",
                    content: contentJPG,
                },
            ];

            resp = await apiPOST(
                `/public/postings/${posting.url_token}/submit`,
                surveyWithTranscript,
                true
            );
            expect(resp).toHaveStatus("success");

            resp = await apiPOST("/debug/active_user", adminUser);
            expect(resp).toHaveStatus("success");

            resp = await apiGET(`/admin/sessions/${session.id}/applications`);
            let pdf_url_token = resp.payload[0].documents[0].url_token;
            let jpg_url_token = resp.payload[0].documents[1].url_token;

            let hashes = getMD5Hashes(pdf_url_token, "pdf");
            expect(hashes[0]).toEqual(hashes[1])

            hashes = getMD5Hashes(jpg_url_token, "jpg");
            expect(hashes[0]).toEqual(hashes[1])
        });

        // This is to test for a possible regression related to https://github.com/rails/rails/issues/41903
        it("Can submit and retrieve attachments for some custom questions", async () => {
            // Create a new posting with a custom question requiring file attachment
            let postingWithCustomQuestion = {
                name: "2021 Spring Posting",
                intro_text: "Intro text for spring posting",
                open_date: new Date("2021/01/05").toISOString(),
                close_date: new Date("2021/04/31").toISOString(),
                availability: "auto",
            };

            postingWithCustomQuestion.custom_questions = {
                title: "Title1",
                description: "description1",
                pages: [
                    {
                        name: "page1",
                        elements: [
                            {
                                type: "file",
                                name: "question1",
                                title: "This is a file question",
                                maxSize: 0,
                            },
                        ],
                    },
                ],
            };

            let resp = await apiPOST(
                `/admin/sessions/${session.id}/postings`,
                postingWithCustomQuestion
            );
            expect(resp).toHaveStatus("success");
            Object.assign(posting, resp.payload);
            checkPropTypes(postingPropTypes, posting);
            expect(posting.id).not.toBeNull();

            resp = await apiPOST(
                `/admin/postings/${posting.id}/posting_positions`,
                { position_id: position.id }
            );
            expect(resp).toHaveStatus("success");

            resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            // Create and submit survey.js data after base64 encoding transcript
            let str = fs.readFileSync(
                path.resolve(__dirname, "./image-data/dummy.txt"),
                {
                    encoding: "base64",
                }
            );
            let content_str = "data:text/plain;base64," + str;
            let surveyWithTranscript = {
                ...surveyWithoutTranscript,
            };

            // Attach as an answer to custom question
            surveyWithTranscript.answers.question1 = [
                {
                    name: "dummy.txt",
                    type: "text/plain",
                    content: "data:text/plain;base64," + content_str,
                },
            ];
            surveyWithTranscript.answers.position_preferences = {
                [position.position_code]: 3,
            };

            resp = await apiPOST(
                `/public/postings/${posting.url_token}/submit`,
                surveyWithTranscript,
                true
            );
            expect(resp).toHaveStatus("success");

            resp = await apiPOST("/debug/active_user", adminUser);
            expect(resp).toHaveStatus("success");

            resp = await apiGET(`/admin/sessions/${session.id}/applications`);
            let url_token = resp.payload[0].documents[0].url_token;

            resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            let hashes = getMD5Hashes(url_token, "txt");
            expect(hashes[0]).toEqual(hashes[1])
        });
    });
}
