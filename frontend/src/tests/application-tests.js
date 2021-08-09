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

// Use md5sum of files and compare them

export function applicationsTests({ apiGET, apiPOST }) {
    let session;
    let position;
    let posting = {};
    let adminUser;
    let surveyData;

//    const fs = require("fs");
//    const path = require("path");
    const BACKEND_BASE_URL = "http://backend:3000";
//    const md5 = require("md5");

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
        });

        it.todo("Get survey.js posting data through public route");
        it.todo(
            "Survey.js posting data is pre-filled based on prior applicant/application data"
        );

        it.skip("Can submit survey.js data via the public postings route", async () => {
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
        it("Can submit and retrieve attachments for a new application", async () => {
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
            resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            // Create and submit survey.js data after encoding in base64
            let str = fs.readFileSync(
                path.resolve(__dirname, "./image-data/dummy.txt"),
                {
                    encoding: "base64",
                }
            );
            let content_str = "data:text/plain;base64," + str;
            let surveyWithTranscript = {
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
                    transcripts: [
                        {
                            name: "dummy.txt",
                            type: "text/plain",
                            content: content_str,
                        },
                    ],
                    previous_university_ta: false,
                    previous_department_ta: true,
                    previous_other_university_ta: false,
                    previous_experience_summary: "n/a",
                    position_preferences: {
                        [position.position_code]: 3,
                    },
                    comments: "n/a",
                },
            };

            // Submit survey.js data
            resp = await apiPOST(
                `/public/postings/${posting.url_token}/submit`,
                surveyWithTranscript,
                true
            );
            expect(resp).toHaveStatus("success");

            // Switch back to default admin
            resp = await apiPOST("/debug/active_user", adminUser);
            expect(resp).toHaveStatus("success");

            // Get application's url_token
            resp = await apiGET(`/admin/sessions/${session.id}/applications`);
            let url_token = resp.payload[0].documents[0].url_token;

            // Switching back to taonlyuser
            resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            // // Write the retrieved txt data to a file and verify
  	axios.request({
	    responseType: 'arraybuffer',
	    url: `${BACKEND_BASE_URL}/public/files/${url_token}`,
	    method: 'get',
	    headers: {
	            'Content-Type': 'text/plain',
	        },
	}).then((result) => {
	    let retrievedData = new Uint8Array(result.data);
	    let originalData = fs.readFileSync(path.resolve(__dirname, './image-data/dummy.txt'));
	    expect(md5(retrievedData)).toEqual(md5(originalData));
	});
	
	});
        it.todo(
            "Can submit and retrieve attachments for an updated application"
        );

        it.skip("Can submit a jpg/png file as a 'transcript' for an application; the resulting file can be retrieved", async () => {
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
            resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            // Create and submit survey.js data after base64 encoding transcript
            let str = fs.readFileSync(
                path.resolve(__dirname, "./image-data/dummy.jpg"),
                {
                    encoding: "base64",
                }
            );
            let content_str = "data:image/jpeg;base64," + str;
            let surveyWithTranscript = {
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
                    transcripts: [
                        {
                            name: "dummy.jpg",
                            type: "image/jpeg",
                            content: content_str,
                        },
                    ],
                    previous_university_ta: false,
                    previous_department_ta: true,
                    previous_other_university_ta: false,
                    previous_experience_summary: "n/a",
                    position_preferences: {
                        [position.position_code]: 3,
                    },
                    comments: "n/a",
                },
            };

            // Submit survey.js data
            resp = await apiPOST(
                `/public/postings/${posting.url_token}/submit`,
                surveyWithTranscript,
                true
            );
            expect(resp).toHaveStatus("success");

            // Switch back to default admin
            resp = await apiPOST("/debug/active_user", adminUser);
            expect(resp).toHaveStatus("success");

            // Get application's url_token
            resp = await apiGET(`/admin/sessions/${session.id}/applications`);
            let url_token = resp.payload[0].documents[0].url_token;
            // console.log(url_token);

            // Switching back to taonlyuser
            resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            axios.request({
		      responseType: 'arraybuffer',
		      url: `${BACKEND_BASE_URL}/public/files/${url_token}`,
		      method: 'get',
		      headers: {
			          'Content-Type': 'image/jpeg',
			        },
	    }).then((result) => {
		    let retrievedData = new Uint8Array(result.data);
		    let originalData = fs.readFileSync(path.resolve(__dirname, "./image-data/dummy.jpg"));
		    expect(md5(retrievedData)).toEqual(md5(originalData));
	    });
        });

        it.skip("Can submit a pdf file as a 'transcript' for an application; the resulting file can be retrieved", async () => {
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
            let str = fs.readFileSync(
                path.resolve(__dirname, "./image-data/dummy.pdf"),
                {
                    encoding: "base64",
                }
            );
            let content = "data:application/pdf;base64," + str;

            let surveyWithTranscript = {
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
                    transcripts: [
                        {
                            name: "dummy.pdf",
                            type: "application/pdf",
                            content: content,
                        },
                    ],
                    previous_university_ta: false,
                    previous_department_ta: true,
                    previous_other_university_ta: false,
                    previous_experience_summary: "n/a",
                    position_preferences: {
                        [position.position_code]: 3,
                    },
                    comments: "n/a",
                },
            };

            // Submit survey.js data
            resp = await apiPOST(
                `/public/postings/${posting.url_token}/submit`,
                surveyWithTranscript,
                true
            );
            expect(resp).toHaveStatus("success");

            // Switch back to default admin
            resp = await apiPOST("/debug/active_user", adminUser);
            expect(resp).toHaveStatus("success");

            // Get application's url_token
            resp = await apiGET(`/admin/sessions/${session.id}/applications`);
            let url_token = resp.payload[0].documents[0].url_token;
            console.log(url_token);

            // Write the retrieved PDF data to a file and verify
    	    axios.request({
	        responseType: 'arraybuffer',
	        url: `${BACKEND_BASE_URL}/public/files/${url_token}`,
	        method: 'get',
	        headers: {
		        'Content-Type': 'application/pdf',
		    },
	    }).then((result) => {
	        let retrievedData = new Uint8Array(result.data);
	        let originalData = fs.readFileSync(path.resolve(__dirname, './image-data/dummy.pdf'));
	        expect(md5(retrievedData)).toEqual(md5(originalData));
	    });
	});

        it.skip("Can submit and retrieve multiple files as a 'transcript' for an application", async () => {
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
                    transcripts: [
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
                    ],
                    previous_university_ta: false,
                    previous_department_ta: true,
                    previous_other_university_ta: false,
                    previous_experience_summary: "n/a",
                    position_preferences: {
                        [position.position_code]: 3,
                    },
                    comments: "n/a",
                },
            };


            // Submit survey.js data
            resp = await apiPOST(
                `/public/postings/${posting.url_token}/submit`,
                surveyWithTranscript,
                true
            );
            expect(resp).toHaveStatus("success");

            // Switch back to default admin
            resp = await apiPOST("/debug/active_user", adminUser);
            expect(resp).toHaveStatus("success");

            // Get application's pdf and jpg url_tokens
            resp = await apiGET(`/admin/sessions/${session.id}/applications`);
            console.log(resp.payload[0]);
            let pdf_url_token = resp.payload[0].documents[0].url_token;
            let jpg_url_token = resp.payload[0].documents[1].url_token;

            // Write the retrieved pdf data to a file and verify
    axios.request({
	    responseType: 'arraybuffer',
	    url: `${BACKEND_BASE_URL}/public/files/${pdf_url_token}`,
	    method: 'get',
	    headers: {
		            'Content-Type': 'application/pdf',
		        },
}).then((result) => {
	    let retrievedData = new Uint8Array(result.data);
	    let originalData = fs.readFileSync(path.resolve(__dirname, './image-data/dummy.pdf'));
	    console.log("pdf");
	console.log(md5(retrievedData));
	console.log(md5(originalData));
	    expect(md5(retrievedData)).toEqual(md5(originalData));
});
	    // Write the retrieved jpg data to a file and verify
       	axios.request({
	    responseType: 'arraybuffer',
	    url: `${BACKEND_BASE_URL}/public/files/${jpg_url_token}`,
	    method: 'get',
	    headers: {
	            'Content-Type': 'image/jpeg',
	        },
	}).then((result) => {
	    let retrievedData = new Uint8Array(result.data);
	    let originalData = fs.readFileSync(path.resolve(__dirname, './image-data/dummy.jpg'));
		console.log("jpg");
		console.log(md5(retrievedData));
		console.log(md5(originalData));
	    expect(md5(retrievedData)).toEqual(md5(originalData));
	});
});
        // This is to test for a possible regression related to https://github.com/rails/rails/issues/41903
        it.skip("Can submit and retrieve attachments for some custom questions", async () => {
            // Create a new posting with additional custom questions
            postingData.custom_questions = {
                title: "Title1",
                description: "description1",
                pages: [
                    {
                        name: "page1",
                        elements: [
                            {
                                type: "file",
                                name: "question1",
                                title: "this is a file question",
                                maxSize: 0,
                            },
                        ],
                    },
                ],
            };

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
                answers: {
                    utorid: "smithh",
                    first_name: "matthew",
                    last_name: "chun",
                    email: "wef@test.ca",
                    phone: "6472222222",
                    student_number: "10000000",
                    program: "P",
                    program_start: "2021-07-01",
                    department: "cs",
                    question1: [
                        {
                            name: "dummy.txt",
                            type: "text/plain",
                            content: "data:text/plain;base64," + content_str,
                        },
                    ],
                    previous_university_ta: false,
                    previous_department_ta: true,
                    previous_other_university_ta: false,
                    previous_experience_summary: "n/a",
                    position_preferences: {
                        [position.position_code]: 3,
                    },
                    comments: "n/a",
                },
            };

            // Submit survey.js data
            resp = await apiPOST(
                `/public/postings/${posting.url_token}/submit`,
                surveyWithTranscript,
                true
            );
            expect(resp).toHaveStatus("success");

            // Switch back to default admin
            resp = await apiPOST("/debug/active_user", adminUser);
            expect(resp).toHaveStatus("success");

            // Get application's url_token
            resp = await apiGET(`/admin/sessions/${session.id}/applications`);
            console.log(resp.payload[0]);
            let url_token = resp.payload[0].documents[0].url_token;
            console.log(url_token);

            // Switching back to taonlyuser
            resp = await apiPOST("/debug/active_user", taOnlyUser);
            expect(resp).toHaveStatus("success");

            // Write the retrieved txt data to a file and verify
axios.request({
    responseType: 'arraybuffer',
    url: `${BACKEND_BASE_URL}/public/files/${url_token}`,
    method: 'get',
    headers: {
            'Content-Type': 'text/plain',
        },
}).then((result) => {
    let retrievedData = new Uint8Array(result.data);
    let originalData = fs.readFileSync(path.resolve(__dirname, './image-data/dummy.txt'));
    expect(md5(retrievedData)).toEqual(md5(originalData));
});});
    });
}
