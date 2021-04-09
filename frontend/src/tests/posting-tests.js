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
import { apiPropTypes } from "../api/defs/prop-types";

// TODO: Remove eslint disable. This can be done as soon as these tests are actually implemented.
// eslint-disable-next-line
export function postingTests(api = { apiGET, apiPOST }) {
    const { apiGET, apiPOST } = api;
    let session;
    let position;
    let resp;
    let posting;
    let postingPos;

    beforeAll(async () => {
        await databaseSeeder.seed(api);
        await databaseSeeder.seedForPostings(api);
        session = databaseSeeder.seededData.session;
        position = databaseSeeder.seededData.position;
        posting = databaseSeeder.seededData.posting;
        postingPos = databaseSeeder.seededData.postingPosition;
    });

    it("Create a posting for a session", async () => {
        const newPosting = {
            name: "CSC100F",
            intro_text: "Testing posting for CSC100F",
            open_date: "2021/01/01",
            close_date: "2021/05/01",
            availability: "auto",
            custom_questions: [
                "What year of study are you in?",
                "Do you have any previous TA experience?",
            ],
            session_id: session.id,
        };

        resp = await apiPOST("/admin/postings", newPosting);
        expect(resp).toHaveStatus("success");
        Object.assign(newPosting, resp.payload);
        checkPropTypes(postingPropTypes, newPosting);
        expect(newPosting.id).not.toBeNull();

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
        Object.assign(newPosting2, resp.payload);
        checkPropTypes(postingPropTypes, newPosting2);
        expect(newPosting2.id).not.toBeNull();
    });

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
    });
    it("Cannot set the `status` of a posting to an invalid value", async () => {
        const updatedPostingData = {
            id: posting.id,
            availability: "test",
        };
        resp = await apiPOST("/admin/postings", updatedPostingData);
        expect(resp).toHaveStatus("error");

        updatedPostingData.availability = 3;
        resp = await apiPOST("/admin/postings", updatedPostingData);
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
        const newPostingPos = {
            hours: 30,
            num_positions: 4,
            position_id: position.id,
        };
        resp = await apiPOST(
            `/admin/postings/${posting.id}/posting_positions`,
            newPostingPos
        );
        expect(resp).toHaveStatus("success");
        checkPropTypes(postingPositionPropTypes, resp.payload);
        expect(resp.payload.id).not.toBeNull();
        expect(resp.payload.posting_id).toEqual(posting.id);
    });
    it.todo("A posting contains a list of all associated posting_position ids"); //create or fetch?
    it.todo("A posting contains a list of all associated application ids"); //create or fetch?
    it("Fetch a survey for a posting", async () => {
        resp = await apiGET(`/admin/postings/${posting.id}/survey`);
        expect(resp).toHaveStatus("success");
    });
    it.todo(
        "Survey for a posting includes questions related to each PostingPosition"
    );
    it("Cannot create a posting_position with a position associated with a different session than the posting", async () => {
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
    it("Delete a posting_position", async () => {
        resp = await apiPOST(`/admin/posting_positions/delete`, {
            id: postingPosition.id,
        }); // undefined method `destroy!'
        expect(resp).toHaveStatus("success");
        resp = await apiGET(`/admin/posting_positions/${postingPosition.id}`);
        expect(resp).toHaveStatus("error");
    });
    it("Modify a posting_position", async () => {
        console.log(postingPos);
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
    it("Deleting a posting also deletes all associated posting_positions", async () => {
        resp = await apiPOST("/admin/postings/delete", { id: posting.id });
        expect(resp).toHaveStatus("success");
        resp = await apiGET(`/admin/posting_positions/${postingPos.id}`);
        expect(resp).toHaveStatus("error");
    });
    it.todo(
        "Cannot create two posting_positions with the same position_id for a single posting"
    );
    it.todo(
        "Can create two posting_positions with the same position_id for different postings"
    );
}
