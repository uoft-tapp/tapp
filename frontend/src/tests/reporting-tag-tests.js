import PropTypes from "prop-types";
import {
    checkPropTypes,
    positionPropTypes,
    errorPropTypes,
    expect,
    it,
    beforeAll,
    apiGET,
    apiPOST,
    reportingTagsPropTypes,
} from "./utils";

import { databaseSeeder } from "./setup";

// TODO: Remove eslint disable. This can be done as soon as these tests are actually implemented.
// eslint-disable-next-line
export function reportingTagsTests(api = { apiGET, apiPOST }) {
    const { apiGET, apiPOST } = api;
    const session = databaseSeeder.seededData.session,
        contractTemplate = databaseSeeder.seededData.contractTemplate,
        assignment = databaseSeeder.seededData.assignment,
        position = databaseSeeder.seededData.position;

    let wage_chunk;

    beforeAll(async () => {
        await databaseSeeder.seed(api);

        // Get wageChunks
        const resp = await apiGET(
            `/admin/assignments/${assignment.id}/wage_chunks`
        );
        expect(resp).toHaveStatus("success");
    });

    it("create reporting_tags for position", async () => {
        const reporting_tag = {
            name: "The Big Cheese",
        };

        const resp1 = await apiPOST(
            `/admin/positions/${position.id}/reporting_tags`,
            reporting_tag
        );

        expect(resp1).toHaveStatus("success");
        expect(resp1.payload).toContainObject(reporting_tag);
    });

    it("delete reporting_tags for position", async () => {
        const reporting_tag = {
            name: "The Big Bad Cheese",
        };

        const resp1 = await apiPOST(
            `/admin/positions/${position.id}/reporting_tags`,
            reporting_tag
        );
        expect(resp1).toHaveStatus("success");

        const resp2 = await apiPOST(
            `/admin//positions/${position.id}/reporting_tags/delete`,
            reporting_tag
        );
        expect(resp2).toHaveStatus("success");
        expect(resp2.payload).toContainObject(reporting_tag);

        const resp3 = await apiGET(
            `/admin//positions/${position.id}/reporting_tags`
        );

        expect(resp3).toHaveStatus("success");
        expect(resp3.payload).not.toContainObject(reporting_tag);
    });

    it("get reporting_tags for position", async () => {
        let reporting_tag = {
            name: "The Bigger Cheese",
        };

        const resp = await apiGET(
            `/admin//positions/${position.id}/reporting_tags`
        );

        expect(resp).toHaveStatus("success");
        expect(resp.payload).not.toContainObject(reporting_tag);

        const resp1 = await apiPOST(
            `/admin/positions/${position.id}/reporting_tags`,
            reporting_tag
        );

        const resp2 = await apiGET(
            `/admin//positions/${position.id}/reporting_tags`
        );

        expect(resp2).toHaveStatus("success");
        expect(resp2.payload).toContainObject(reporting_tag);
    });

    // it("create and delete reporting_tags for wage_chunk", async () => {
    //     let reporting_tag = {
    //         name: "The Big Cheese",
    //     };

    //     const resp1 = await apiPOST(
    //         `/admin/positions/${position.id}/reporting_tags`,
    //         reporting_tag
    //     );

    //     expect(resp1).toHaveStatus("success");

    //     // make sure the reporting tag we created is in that list and has the correct props
    //     expect(resp1.payload).toContain(reporting_tag);

    //     const resp2 = await apiPOST(
    //         `/admin//positions/${position.id}/reporting_tags/delete`
    //     );

    //     expect(resp2).toHaveStatus("success");

    //     const resp3 = await apiGET(
    //         `/admin//positions/${position.id}/reporting_tags`
    //     );

    //     expect(resp3).toHaveStatus("success");
    //     expect(resp3.payload).toContainObject([]);
    // });

    it.todo("get all reporting_tags associated to positions for session");
    it.todo("get all reporting_tags associated to wage_chunks for session");
    it.todo("get reporting_tags for wage_chunk");
}
