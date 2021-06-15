/**
 * @jest-environment node
 */
/* eslint-env node */
import { describe, it, expect, apiGET } from "./utils";

import Route from "route-parser";
import * as TJS from "typescript-json-schema";
import { resolve } from "path";
import { mockAPI } from "../api/mockAPI";

const BASE_PATH = "/app/src/api/defs/types/";
const TYPES_FILE = "raw-types.ts";
const COMPLIER_OPTIONS = { strictNullChecks: true };

describe("Documentation tests", () => {
    it("All attributes from types reported by the backend are included in the typescript types", async () => {
        const resp = await apiGET("/debug/serializers");
        expect(resp).toHaveStatus("success");
        const typesFromBackend = resp.payload;

        // Generate types from the typescript definitions
        const program = TJS.getProgramFromFiles(
            [resolve(BASE_PATH + "/" + TYPES_FILE)],
            COMPLIER_OPTIONS
        );

        const schema = TJS.generateSchema(program, "*");
        const typescriptTypes = schema.definitions || {};

        for (const type of typesFromBackend) {
            const { name, attributes } = type;
            // We expect there to be a Typescript type corresponding to `name` but prefixed with `Raw`.
            // This type should have the attributes reported by the backend.
            const typescriptName = `Raw${name}`;
            expect(typescriptTypes).toContainTypeDescription({
                name: typescriptName,
                attributes,
            });
        }
    });

    it("Routes are all documented", async () => {
        const resp = await apiGET("/debug/routes");
        expect(resp).toHaveStatus("success");
        const routesFromBackend = resp.payload;

        const missingRoutes = [];

        // Every route that the backend has should be documented.
        // We count a route as documented if it is listed in the mockAPI.
        for (const route of routesFromBackend) {
            // For now, we ignore the starting "/api/v1/*" where `*` is `admin` `instructor` `ta`.
            const path = route.path
                .replace(/^\/api\/v1/, "")
                .replace(/^\/admin\//, "/")
                .replace(/^\/instructor\//, "/")
                .replace(/^\/ta\//, "/");
            const parser = new Route(path);
            let documentedRoutes =
                route.verb === "GET"
                    ? Object.keys(mockAPI.getRoutes)
                    : Object.keys(mockAPI.postRoutes);
            if (!documentedRoutes.some((x) => parser.match(x))) {
                missingRoutes.push(
                    `${route.verb} route ${route.path} exists in the backend but is not documented in the mock API`
                );
            }
        }

        expect(missingRoutes).toListNoMissingRoutes();

        //console.log(mockAPI.getRoutes)
    });
});
