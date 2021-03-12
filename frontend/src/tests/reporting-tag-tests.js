import { expect, it, beforeAll, apiGET, apiPOST } from "./utils";
import { databaseSeeder } from "./setup";

// TODO: Remove eslint disable. This can be done as soon as these tests are actually implemented.
// eslint-disable-next-line
export function reportingTagsTests(api = { apiGET, apiPOST }) {
    const { apiGET, apiPOST } = api;
    const session = databaseSeeder.seededData.session,
        assignment = databaseSeeder.seededData.assignment,
        position = databaseSeeder.seededData.position;

    let wage_chunk;

    beforeAll(async () => {
        await databaseSeeder.seed(api);

        // Get wageChunks
        const resp = await apiGET(
            `/admin/assignments/${assignment.id}/wage_chunks`
        );

        wage_chunk = resp.payload[0];
    });

    it("create reporting_tags for position", async () => {
        const reporting_tag = {
            name: "Test reporting tag for position creation",
        };

        const resp1 = await apiPOST(
            `/admin/positions/${position.id}/reporting_tags`,
            reporting_tag
        );

        expect(resp1).toHaveStatus("success");
        expect(resp1.payload).toMatchObject(reporting_tag);
    });

    it("delete reporting_tags for position", async () => {
        const reporting_tag = {
            name: "Test reporting tag position delete",
        };

        const resp1 = await apiPOST(
            `/admin/positions/${position.id}/reporting_tags`,
            reporting_tag
        );
        expect(resp1).toHaveStatus("success");

        const resp2 = await apiPOST(
            `/admin/positions/${position.id}/reporting_tags/delete`,
            reporting_tag
        );
        expect(resp2).toHaveStatus("success");
        expect(resp2.payload).toMatchObject(reporting_tag);

        const resp3 = await apiGET(
            `/admin/positions/${position.id}/reporting_tags`
        );

        expect(resp3).toHaveStatus("success");
        expect(resp3.payload).not.toMatchObject(reporting_tag);
    });

    it("get reporting_tags for position", async () => {
        let reporting_tag = {
            name: "Test reporting tag for position fetch",
        };

        const resp = await apiGET(
            `/admin/positions/${position.id}/reporting_tags`
        );

        expect(resp).toHaveStatus("success");
        expect(resp.payload).not.toContainObject(reporting_tag);

        await apiPOST(
            `/admin/positions/${position.id}/reporting_tags`,
            reporting_tag
        );

        const resp2 = await apiGET(
            `/admin/positions/${position.id}/reporting_tags`
        );

        expect(resp2).toHaveStatus("success");
        expect(resp2.payload).toContainObject(reporting_tag);
    });

    it("create reporting_tags for wage_chunk", async () => {
        let reporting_tag = {
            name: "Test reporting tag wage chunk creation",
        };

        const resp1 = await apiPOST(
            `/admin/wage_chunks/${wage_chunk.id}/reporting_tags`,
            reporting_tag
        );

        expect(resp1).toHaveStatus("success");
        expect(resp1.payload).toMatchObject(reporting_tag);
    });

    it("delete reporting_tags for wage_chunk", async () => {
        const reporting_tag = {
            name: "Test reporting wage chunk deletion",
        };

        await apiPOST(
            `/admin/wage_chunks/${wage_chunk.id}/reporting_tags`,
            reporting_tag
        );

        const resp2 = await apiPOST(
            `/admin/wage_chunks/${wage_chunk.id}/reporting_tags/delete`,
            reporting_tag
        );
        expect(resp2).toHaveStatus("success");
        expect(resp2.payload).toMatchObject(reporting_tag);

        const resp3 = await apiGET(
            `/admin/wage_chunks/${wage_chunk.id}/reporting_tags`
        );

        expect(resp3).toHaveStatus("success");
        expect(resp3.payload).not.toMatchObject(reporting_tag);
    });

    it("get reporting_tags for wage_chunk", async () => {
        let reporting_tag = {
            name: "Test reporting tag for wage_chunk fetch",
        };

        const resp = await apiGET(
            `/admin/wage_chunks/${wage_chunk.id}/reporting_tags`
        );

        expect(resp).toHaveStatus("success");
        expect(resp.payload).not.toContainObject(reporting_tag);

        await apiPOST(
            `/admin/wage_chunks/${wage_chunk.id}/reporting_tags`,
            reporting_tag
        );

        const resp2 = await apiGET(
            `/admin/wage_chunks/${wage_chunk.id}/reporting_tags`
        );

        expect(resp2).toHaveStatus("success");
        expect(resp2.payload).toContainObject(reporting_tag);
    });

    it("get all reporting_tags associated to position for session", async () => {
        let reporting_tag = {
            name: "Test reporting tag for position fetch in session",
        };

        const resp = await apiGET(
            `/admin/sessions/${session.id}/positions/reporting_tags`
        );

        expect(resp).toHaveStatus("success");
        expect(resp.payload).not.toContainObject(reporting_tag);

        await apiPOST(
            `/admin/positions/${position.id}/reporting_tags`,
            reporting_tag
        );

        const resp2 = await apiGET(
            `/admin/sessions/${session.id}/positions/reporting_tags`
        );

        expect(resp2).toHaveStatus("success");
        expect(resp2.payload).toContainObject(reporting_tag);
    });

    it("get all reporting_tags associated to wage_chunks for session", async () => {
        let reporting_tag = {
            name: "Test reporting tag for wage_chunk fetch in session",
        };

        const resp = await apiGET(
            `/admin/sessions/${session.id}/wage_chunks/reporting_tags`
        );

        expect(resp).toHaveStatus("success");

        await apiPOST(
            `/admin/wage_chunks/${wage_chunk.id}/reporting_tags`,
            reporting_tag
        );

        const resp2 = await apiGET(
            `/admin/sessions/${session.id}/wage_chunks/reporting_tags`
        );

        expect(resp2).toHaveStatus("success");
        expect(resp2.payload).toContainObject(reporting_tag);
    });
}
