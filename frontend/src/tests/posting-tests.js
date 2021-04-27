import {
    it,
    beforeAll,
    expect,
    checkPropTypes,
    postingPropTypes,
    postingPositionPropTypes,
    surveyPropTypes,
    addSession,
} from "./utils";
import PropTypes from "prop-types";
import { databaseSeeder } from "./setup";

export function postingTests(api) {
    const { apiGET, apiPOST } = api;
    let session;
    let contractTemplate;
    let session2;
    let position;
    let resp;
    const posting = {
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
                        },
                        {
                            type: "text",
                            name: "question2",
                        },
                    ],
                },
                {
                    name: "page2",
                    elements: [
                        {
                            type: "text",
                            name: "question3",
                        },
                        {
                            type: "text",
                            name: "question4",
                        },
                    ],
                },
            ],
        },
    };
    const posting2 = {
        name: "CSC200F TA",
        intro_text: "Testing posting for CSC200F",
        open_date: "2021/04/01",
        close_date: "2021/05/01",
        availability: "open",
    };
    const postingPos = {
        hours: 20,
        num_positions: 1,
    };

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        session = databaseSeeder.seededData.session;
        position = databaseSeeder.seededData.position;
        contractTemplate = databaseSeeder.seededData.contractTemplate;
        session2 = await addSession(api);
    });

    it("Create a posting for a session", async () => {
        resp = await apiPOST("/admin/postings", {
            ...posting,
            session_id: session.id,
        });
        expect(resp).toHaveStatus("success");
        checkPropTypes(postingPropTypes, resp.payload);
        expect(resp.payload.id).not.toBeNull();
        Object.assign(posting, resp.payload);

        resp = await apiPOST(
            `/admin/sessions/${session.id}/postings`,
            posting2
        );
        expect(resp).toHaveStatus("success");
        checkPropTypes(postingPropTypes, resp.payload);
        expect(resp.payload.id).not.toBeNull();
        Object.assign(posting2, resp.payload);
    });

    // MUST run "Create a posting for a session" first to load data into ‘posting’
    it("Modify a posting", async () => {
        const updatedPostingData = {
            id: posting.id,
            open_date: "2021-06-01T00:00:00.000Z",
            close_date: "2021-08-01T00:00:00.000Z",
            availability: "open",
        };
        resp = await apiPOST("/admin/postings", updatedPostingData);
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject(updatedPostingData);

        const updatedPostingData2 = {
            id: posting.id,
            open_date: "2021-07-01T00:00:00.000Z",
            close_date: "2021-09-01T00:00:00.000Z",
            availability: "auto",
        };
        resp = await apiPOST(
            `/admin/sessions/${session.id}/postings`,
            updatedPostingData2
        );
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject(updatedPostingData2);
        Object.assign(posting, resp.payload);
    });

    it("Cannot set the `status` of a posting to an invalid value", async () => {
        resp = await apiPOST("/admin/postings", {
            ...posting,
            availability: "test",
        });
        expect(resp).toHaveStatus("error");

        resp = await apiPOST("/admin/postings", {
            ...posting,
            availability: 3,
        });
        expect(resp).toHaveStatus("error");
    });

    it("Fetch all postings for a session", async () => {
        resp = await apiGET(`/admin/sessions/${session.id}/postings`);
        expect(resp).toHaveStatus("success");
        checkPropTypes(PropTypes.arrayOf(postingPropTypes), resp.payload);
        expect(resp.payload).toContainObject(posting);
        expect(resp.payload).toContainObject(posting2);
    });

    it("Two postings for the same session cannot have the same name", async () => {
        const newPosting = {
            name: "CSC300F TA",
            intro_text: "Posting 1 for CSC300F",
            open_date: "2021/04/01",
            close_date: "2021/05/01",
            availability: "auto",
        };

        resp = await apiPOST(
            `/admin/sessions/${session.id}/postings`,
            newPosting
        );
        expect(resp).toHaveStatus("success");

        const newPosting2 = {
            name: "CSC300F TA",
            intro_text: "Posting 2 for CSC300F",
            open_date: "2021/05/01",
            close_date: "2021/06/01",
            availability: "auto",
        };
        resp = await apiPOST(
            `/admin/sessions/${session.id}/postings`,
            newPosting2
        );
        expect(resp).toHaveStatus("error");
    });

    it("Two postings for different sessions may have the same name", async () => {
        const newPosting = {
            name: "CSC400F TA",
            intro_text: "Posting for CSC400F",
            open_date: "2021/04/01",
            close_date: "2021/05/01",
            availability: "auto",
        };

        resp = await apiPOST(
            `/admin/sessions/${session.id}/postings`,
            newPosting
        );
        expect(resp).toHaveStatus("success");

        const newPosting2 = {
            name: "CSC400F TA",
            intro_text: "Posting for CSC400F",
            open_date: "2021/04/01",
            close_date: "2021/05/01",
            availability: "auto",
        };
        resp = await apiPOST(
            `/admin/sessions/${session2.id}/postings`,
            newPosting2
        );
        expect(resp).toHaveStatus("success");
    });

    it("Create a posting_position for a posting", async () => {
        resp = await apiPOST(
            `/admin/postings/${posting.id}/posting_positions`,
            { ...postingPos, position_id: position.id }
        );
        expect(resp).toHaveStatus("success");
        checkPropTypes(postingPositionPropTypes, resp.payload);
        expect(resp.payload.posting_id).toEqual(posting.id);
        Object.assign(postingPos, resp.payload);
    });

    // `/admin/postings/${posting.id}/applications` need to be implemented
    it.todo("Fetch all applications associated with a posting");

    it("Fetch a survey for a posting", async () => {
        resp = await apiGET(`/admin/postings/${posting.id}/survey`);
        expect(resp).toHaveStatus("success");
        checkPropTypes(surveyPropTypes, resp.payload);
    });

    it("Survey for a posting includes questions related to each PostingPosition", async () => {
        // For testing, add an extra position to the session and create a posting position for that position
        const position2 = {
            position_code: "MAT135F",
            position_title: "Calculus I",
            hours_per_assignment: 70,
            start_date: new Date("2018/05/09").toISOString(),
            end_date: new Date("2018/09/09").toISOString(),
            contract_template_id: contractTemplate.id,
        };
        resp = await apiPOST(
            `/admin/sessions/${session.id}/positions`,
            position2
        );
        expect(resp).toHaveStatus("success");
        Object.assign(position2, resp.payload);

        resp = await apiPOST(
            `/admin/postings/${posting.id}/posting_positions`,
            { hours: 20, num_positions: 1, position_id: position2.id }
        );
        expect(resp).toHaveStatus("success");

        // Get all positions in the session
        resp = await apiGET(`admin/sessions/${session.id}/positions`);
        expect(resp).toHaveStatus("success");
        let allPosition = resp.payload;

        // Get all posting positions for the posting
        resp = await apiGET(`/admin/postings/${posting.id}/posting_positions`);
        expect(resp).toHaveStatus("success");
        let allPostingPos = resp.payload;

        // Get the survey object
        resp = await apiGET(`/admin/postings/${posting.id}/survey`);
        expect(resp).toHaveStatus("success");
        const survey = resp.payload;

        // Verify that the survey object contains information for each posting position
        allPostingPos.forEach((postingPos) => {
            const targetPos = allPosition.find(
                (p) => p.id === postingPos.position_id
            );
            expect(
                JSON.stringify(survey).search(
                    targetPos.position_code + " - " + targetPos.position_title
                )
            ).not.toEqual(-1);
        });
    });

    it.skip("Cannot create a posting_position with a position associated with a different session than the posting", async () => {
        const newPosting = {
            name: "CSC500F TA",
            intro_text: "Posting for CSC500F",
            open_date: "2021/04/01",
            close_date: "2021/05/01",
            availability: "auto",
        };

        resp = await apiPOST(
            `/admin/sessions/${session2.id}/postings`,
            newPosting
        );
        expect(resp).toHaveStatus("success");
        Object.assign(newPosting, resp.payload);
        const newPostingPos = {
            hours: 20,
            num_positions: 1,
            position_id: position.id,
        };
        resp = await apiPOST(
            `/admin/postings/${newPosting.id}/posting_positions`,
            newPostingPos
        );
        expect(resp).toHaveStatus("error");
    });

    // MUST run "Create a posting_position for a posting" first to load data into ‘postingPos‘
    it("Modify a posting_position", async () => {
        const updatePostingPos = {
            position_id: postingPos.position_id,
            hours: 10,
            num_positions: 2,
        };

        resp = await apiPOST(
            `/admin/postings/${posting.id}/posting_positions`,
            updatePostingPos
        );
        expect(resp).toHaveStatus("success");
        expect(resp.payload).toMatchObject(updatePostingPos);
    });

    it("Cannot create two posting_positions with the same position_id for a single posting", async () => {
        const newPostingPos = {
            position_id: position.id,
            hours: 10,
            num_positions: 2,
        };

        resp = await apiPOST(
            `/admin/postings/${posting.id}/posting_positions`,
            newPostingPos
        );
        expect(resp).toHaveStatus("success");
        resp = await apiGET(`/admin/postings/${posting.id}/posting_positions`);

        // The previous POST request should not create a new posting_position and instead it upserts to an existing one
        expect(
            resp.payload.filter((p) => p.position_id === position.id).length
        ).toEqual(1);
    });
    it("Can create two posting_positions with the same position_id for different postings", async () => {
        const newPostingPos = {
            position_id: position.id,
            hours: 10,
            num_positions: 2,
        };

        resp = await apiPOST(
            `/admin/postings/${posting2.id}/posting_positions`,
            newPostingPos
        );

        expect(resp).toHaveStatus("success");
        Object.assign(newPostingPos, resp.payload);
        resp = await apiGET(`/admin/postings/${posting2.id}/posting_positions`);
        // Verify a new posting_position is created successfully for the new posting
        expect(
            resp.payload.find((p) => p.position_id === position.id)
        ).toMatchObject(newPostingPos);
    });

    it("Delete a posting_position", async () => {
        resp = await apiPOST(`/admin/posting_positions/delete`, {
            posting_id: posting.id,
            position_id: position.id,
        });
        expect(resp).toHaveStatus("success");
        resp = await apiGET(`/admin/postings/${posting.id}/posting_positions`);
        expect(
            resp.payload.find((p) => p.position_id === position.id)
        ).toBeUndefined();
    });

    it.skip("Deleting a posting also deletes all associated posting_positions", async () => {
        // Recreate the posting_position because it has been deleted in the previous test case
        resp = await apiPOST(
            `/admin/postings/${posting.id}/posting_positions`,
            { ...postingPos, position_id: position.id }
        );
        expect(resp).toHaveStatus("success");
        resp = await apiPOST("/admin/postings/delete", { id: posting.id });
        expect(resp).toHaveStatus("success");
        resp = await apiGET(`/admin/postings/${posting.id}`);
        expect(resp).toHaveStatus("error");
    });
}
