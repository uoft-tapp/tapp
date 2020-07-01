/**
 * @jest-environment node
 */
import { apiGET, apiPOST, describe, it } from "./utils";
import { mockAPI } from "../api/mockAPI";
import { databaseSeeder } from "./setup";
import { sessionsTests } from "./session-tests";
import { positionsTests } from "./position-tests";
import { templatesTests } from "./template-tests";
import { instructorsTests } from "./instructor-tests";
import { assignmentsTests } from "./assignment-tests";
import { wageChunksTests } from "./wage-chunk-tests";
import { offersTests } from "./offer-tests";
import { reportingTagsTests } from "./reporting-tag-tests";
import { applicationsTests } from "./application-tests";
import { unknownRouteTests } from "./unknown-route-tests";
import { usersTests } from "./user-tests";
import { userPermissionsTests } from "./user-permission-tests";

// Run the actual tests for both the API and the Mock API
describe("API tests", () => {
    const api = { apiGET, apiPOST };

    it("Seed the database", async () => {
        await databaseSeeder.seed(api);
        await databaseSeeder.verifySeed(api);
    }, 30000);

    describe("`/admin/sessions` tests", () => {
        sessionsTests(api);
    }, 30000);

    describe("template tests", () => {
        templatesTests(api);
    });

    describe("`/admin/positions` tests", () => {
        positionsTests({ apiGET, apiPOST });
    });
    describe("`/admin/instructors` tests", () => {
        instructorsTests({ apiGET, apiPOST });
    });
    describe("`/admin/assignments` tests", () => {
        assignmentsTests({ apiGET, apiPOST });
    });
    describe("wage_chunk tests", () => {
        wageChunksTests({ apiGET, apiPOST });
    });
    describe.skip("offers tests", () => {
        offersTests({ apiGET, apiPOST });
    });
    describe.skip("reporting_tag tests", () => {
        reportingTagsTests({ apiGET, apiPOST });
    });
    describe.skip("`/admin/applications` tests", () => {
        applicationsTests({ apiGET, apiPOST });
    });
    describe.skip("unknown api route tests", () => {
        unknownRouteTests({ apiGET, apiPOST });
    });
    describe("`/admin/users` tests", () => {
        usersTests({ apiGET, apiPOST });
    });
    describe("User permissions tests", () => {
        userPermissionsTests({ apiGET, apiPOST });
    });
});

describe("Mock API tests", () => {
    it("Seed the database", async () => {
        await databaseSeeder.seed(mockAPI);
        await databaseSeeder.verifySeed(mockAPI);
    });
    describe("`/admin/sessions` tests", () => {
        sessionsTests(mockAPI);
    });
    describe("`/admin/sessions/:session_id/contract_templates` tests", () => {
        templatesTests(mockAPI);
    });
    describe("`/admin/positions` tests", () => {
        positionsTests(mockAPI);
    });
    describe("`/admin/assignments` tests", () => {
        assignmentsTests(mockAPI);
    });
    describe("wage_chunk tests", () => {
        wageChunksTests(mockAPI);
    });
    describe("`/assignments/:assignment_id/active_offer/` tests", () => {
        offersTests(mockAPI);
    });
    describe("`/admin/instructors` tests", () => {
        instructorsTests(mockAPI);
    });
    describe("`/admin/users` tests", () => {
        usersTests(mockAPI);
    });
    describe("User permissions tests", () => {
        userPermissionsTests(mockAPI);
    });
});
