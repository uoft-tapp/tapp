import {
    it,
    beforeAll,
    expect,
    checkPropTypes,
    postingPropTypes,
    postingPositionPropTypes,
    addSession,
} from "./utils";
import PropTypes from "prop-types";
import { databaseSeeder } from "./setup";

export function postingTests(api) {
    const { apiGET, apiPOST } = api;
    let session;
    let position;
    let resp;
    const posting = {
        name: "CSC494F TA",
        intro_text: "TA posting for CSC494F",
        open_date: "2021/01/01",
        close_date: "2021/05/01",
        availability: "auto",
        custom_questions: [
            "What year of study are you in?",
            "Do you have any previous TA experience?",
        ],
    };
    const postingPos = {
        hours: 20,
        num_positions: 1,
    };

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        session = databaseSeeder.seededData.session;
        position = databaseSeeder.seededData.position;
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

        const newPosting2 = {
            name: "CSC200F TA",
            intro_text: "Testing posting for CSC200F",
            open_date: "2021/04/01",
            close_date: "2021/05/01",
            availability: "open",
        };

        resp = await apiPOST(
            `/admin/sessions/${session.id}/postings`,
            newPosting2
        );
        expect(resp).toHaveStatus("success");
        checkPropTypes(postingPropTypes, resp.payload);
        expect(resp.payload.id).not.toBeNull();
    });

    // "Create a posting for a session" has to be run before this test case
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
    });

    it("Can set `custom_questions` to an arbitrary serializable object and the same object (i.e., an object and not the stringified version) gets returned.", async () => {
        const updatePostingData = {
            id: posting.id,
            custom_questions: {
                first: "What year of study are you in?",
                second: "Do you have any previous TA experience?",
            },
        };
        resp = await apiPOST("/admin/postings", updatePostingData);
        expect(resp).toHaveStatus("success");
        expect(resp.payload.custom_questions).toMatchObject(
            updatePostingData.custom_questions
        );
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
        const newSession = await addSession(api);
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
            `/admin/sessions/${newSession.id}/postings`,
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
        console.log(resp.payload.pages);
    });

    it.todo(
        "Survey for a posting includes questions related to each PostingPosition"
    );

    it.skip("Cannot create a posting_position with a position associated with a different session than the posting", async () => {
        const newSession = await addSession(api);
        const newPosting = {
            name: "CSC400F TA",
            intro_text: "Posting for CSC400F",
            open_date: "2021/04/01",
            close_date: "2021/05/01",
            availability: "auto",
        };

        resp = await apiPOST(
            `/admin/sessions/${newSession.id}/postings`,
            newPosting
        );
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

    // "Create a posting_position for a posting" has to be run before this test case
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
        const newPosting = {
            name: "CSC500F TA",
            intro_text: "Posting for CSC500F",
            open_date: "2021/04/01",
            close_date: "2021/05/01",
            availability: "auto",
        };

        resp = await apiPOST(
            `/admin/sessions/${session.id}/postings`,
            newPosting
        );
        Object.assign(newPosting, resp.payload);

        const newPostingPos = {
            position_id: position.id,
            hours: 10,
            num_positions: 2,
        };

        resp = await apiPOST(
            `/admin/postings/${newPosting.id}/posting_positions`,
            newPostingPos
        );

        expect(resp).toHaveStatus("success");
        resp = await apiGET(
            `/admin/postings/${newPosting.id}/posting_positions`
        );
        // Verify a new posting_position is created successfully for the new posting
        expect(
            resp.payload.filter((p) => p.position_id === position.id).length
        ).toEqual(1);
    });

    it("Delete a posting_position", async () => {
        resp = await apiPOST(`/admin/posting_positions/delete`, {
            posting_id: posting.id,
            position_id: position.id,
        });
        expect(resp).toHaveStatus("success");
        resp = await apiGET(`/admin/postings/${posting.id}/posting_positions`);
        expect(
            resp.payload.filter((p) => p.position_id === position.id).length
        ).toEqual(0);
    });

    it.skip("Deleting a posting also deletes all associated posting_positions", async () => {
        // Recreate the posting_position because it has been deleted in the previous test case
        resp = await apiPOST(
            `/admin/postings/${posting.id}/posting_positions`,
            { ...postingPos, position_id: position.id }
        );
        resp = await apiPOST("/admin/postings/delete", { id: posting.id });
        expect(resp).toHaveStatus("success");
        resp = await apiGET(`/admin/postings/${posting.id}`);
        expect(resp).toHaveStatus("error");
    });
}
