import { expect, it, beforeAll, apiGET, apiPOST } from "./utils";
import { databaseSeeder } from "./setup";

// TODO: Remove eslint disable. This can be done as soon as these tests are actually implemented.
// eslint-disable-next-line
export function postingTests(api = { apiGET, apiPOST }) {
    const { apiGET, apiPOST } = api;
    const session = databaseSeeder.seededData.session,
        position = databaseSeeder.seededData.position;

    beforeAll(async () => {
        await databaseSeeder.seed(api);
    });

    it.todo("Create a posting for a session");
    it.todo("Modify a posting");
    it.todo("Cannot set the `status` of a posting to an invalid value");
    it.todo("Fetch all postings for a session");
    it.todo("Two postings for the same session cannot have the same name");
    it.todo("Two postings for different sessions may have the same name");
    it.todo("Create a posting_position for a posting");
    it.todo("A posting contains a list of all associated posting_position ids");
    it.todo("A posting contains a list of all associated application ids");
    it.todo(
        "Cannot create a posting_position with a position associated with a different session than the posting"
    );
    it.todo("Delete a posting_position");
    it.todo("Modify a posting_position");
    it.todo("Deleting a posting also deletes all associated posting_positions");
    it.todo(
        "Cannot create two posting_positions with the same position_id for a single posting"
    );
    it.todo(
        "Can create two posting_positions with the same position_id for different postings"
    );
}
