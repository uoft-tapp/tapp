/**
 * @jest-environment node
 */
import fs from "fs";
import { apiGET, apiPOST, describe, it } from "./utils";
import { mockAPI } from "../api/mockAPI";
import { databaseSeeder } from "./setup";
import { sessionsTests } from "./session-tests";
import { positionsTests } from "./position-tests";
import { templatesTests } from "./template-tests";
import { instructorsTests } from "./instructor-tests";
import { assignmentsTests } from "./assignment-tests";
import { wageChunksTests } from "./wage-chunk-tests";
import {
    offersTests,
    offerEmailTests,
    offerDownloadTests,
} from "./offer-tests";
import { reportingTagsTests } from "./reporting-tag-tests";
import { applicationsTests } from "./application-tests";
import { unknownRouteTests } from "./unknown-route-tests";
import { usersTests } from "./user-tests";
import { userPermissionsTests } from "./user-permission-tests";
import { applicantTests } from "./applicant-tests";
import { instructorsPermissionTests } from "./instructor-permission-test";
import { ddahTests, ddahsEmailAndDownloadTests } from "./ddah-tests";
import { postingTests } from "./posting-tests";

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
        // Remove the test template file if it already exists
        const testFile =
            "/storage_mounted_for_testing/contract_templates/TestTemplate.html";
        if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile);
        }
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
    describe("offers tests", () => {
        // These need to be in separate `describe`.
        // Each one independently defines a `beforeAll` action,
        // and those actions will clobber each other unless they are isolated
        // in different `describe`s.
        describe("basic", () => {
            offersTests({ apiGET, apiPOST });
        });
        describe("email", () => {
            offerEmailTests({ apiGET, apiPOST });
        });
        describe("download", () => {
            offerDownloadTests({ apiGET, apiPOST });
        });
    });
    describe("reporting_tag tests", () => {
        reportingTagsTests({ apiGET, apiPOST });
    });
    describe("`/admin/applications` tests", () => {
        applicationsTests({ apiGET, apiPOST });
    });
    describe("unknown api route tests", () => {
        unknownRouteTests({ apiGET, apiPOST });
    });
    describe("`/admin/users` tests", () => {
        usersTests({ apiGET, apiPOST });
    });
    describe("`/admin/applicants` tests", () => {
        applicantTests({ apiGET, apiPOST });
    });
    describe("User permissions tests", () => {
        userPermissionsTests({ apiGET, apiPOST });
    });
    describe("Instructor permissions tests", () => {
        instructorsPermissionTests({ apiGET, apiPOST });
    });
    describe("Posting tests", () => {
        postingTests({ apiGET, apiPOST });
    });
    describe("DDAH tests", () => {
        // These need to be in separate `describe`.
        // Each one independently defines a `beforeAll` action,
        // and those actions will clobber each other unless they are isolated
        // in different `describe`s.
        describe("basic", () => {
            ddahTests({ apiGET, apiPOST });
        });
        describe("email and download", () => {
            ddahsEmailAndDownloadTests({ apiGET, apiPOST });
        });
    });
});

describe("Mock API tests", () => {
    const { apiGET, apiPOST } = mockAPI;

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
    describe("DDAH tests", () => {
        ddahTests({ apiGET, apiPOST });
    });
});
