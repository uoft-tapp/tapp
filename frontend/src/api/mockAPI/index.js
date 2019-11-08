import Route from "route-parser";
import { mockData } from "./data";
import { applicationsRoutes } from "./applications";
import { sessionsRoutes } from "./sessions";
import { templatesRoutes } from "./position_templates";
import { positionsRoutes } from "./positions";
import { instructorsRoutes } from "./instructors";
import { documentCallback } from "../defs/doc-generation";

/**
 * Mock API server that runs locally; useuful for demo purposes.
 *
 * @module
 */

/**
 * Pick an item from an array whose id === `id`.
 *
 * @param {Object[]} array Array to be picked from
 * @param {any} id Value to match on
 * @param {string} [key="id"] Which key to match on
 * @returns
 */
function pickFromArray(array, id, key = "id") {
    for (let elm of array) {
        if (elm[key] === id) {
            return elm;
        }
    }
}

export class MockAPI {
    routePrefix = "/api/v1";
    // a list of selectors for each route
    getRoutes = Object.assign(
        {},
        applicationsRoutes.get,
        sessionsRoutes.get,
        templatesRoutes.get,
        positionsRoutes.get,
        instructorsRoutes.get,
        {
            "/all_data": documentCallback({
                func: data => data,
                exclude: true
            }),
            "/sessions/:session_id/assignments": (data, params) => [
                ...data.assignments[params.session_id]
            ],
            "/sessions/:session_id/applicants": (data, params) =>
                data.applicants_by_session[params.session_id].map(utorid =>
                    pickFromArray(data.applicants, utorid, "utorid")
                )
        }
    );
    postRoutes = Object.assign(
        {},
        sessionsRoutes.post,
        templatesRoutes.post,
        positionsRoutes.post,
        instructorsRoutes.post
    );

    constructor(seedData) {
        this.active = false;
        this.data = seedData;
        this._getRoutesParsers = Object.keys(this.getRoutes).map(
            routeStr => new Route(routeStr)
        );
        this._postRoutesParsers = Object.keys(this.postRoutes).map(
            routeStr => new Route(routeStr)
        );
    }

    /**
     * Make a mock `apiGET` call. Always returns an object of
     * the form
     * `{status: ..., message: ..., payload: ...}`
     * This method is bound, so it is safe to pass this function around.
     *
     * @memberof MockAPI
     * @param {string} url An API route without `/api/v1` (e.g., `/sessions`)
     */
    apiGET = url => {
        for (const route of this._getRoutesParsers) {
            const match = route.match(url);
            // if we have a match, run the selector with the parsed data
            if (match) {
                try {
                    const payload = this.getRoutes[route.spec](
                        this.data,
                        match
                    );
                    if (payload == null) {
                        throw new Error(
                            `Could not find data for route ${
                                route.spec
                            } with params ${JSON.stringify(match)}`
                        );
                    }
                    return {
                        status: "success",
                        message: "",
                        payload
                    };
                } catch (e) {
                    return { status: "error", message: e.toString() };
                }
            }
        }
        return {
            status: "error",
            message: `could not find route matching ${url}`
        };
    };

    /**
     * Make a mock `apiPOST` call. Always returns an object of
     * the form
     * `{status: ..., message: ..., payload: ...}`
     * This method is bound, so it is safe to pass this function around.
     *
     * @memberof MockAPI
     * @param {string} url An API route without `/api/v1` (e.g., `/sessions`)
     * @param {object} body The body of a post request. This should be an object, *not* a JSON string.
     */
    apiPOST = (url, body) => {
        for (const route of this._postRoutesParsers) {
            const match = route.match(url);
            // if we have a match, run the selector with the parsed data
            if (match) {
                try {
                    const payload = this.postRoutes[route.spec](
                        this.data,
                        match,
                        body
                    );
                    return {
                        status: "success",
                        message: "",
                        payload
                    };
                } catch (e) {
                    return { status: "error", message: e.toString() };
                }
            }
        }
        return {
            status: "error",
            message: `could not find route matching ${url}`
        };
    };

    /**
     * Replaces the global `window.fetch` object with calls to `apiGET` and
     * `apiPOST`. This means that true network requests will no longer
     * work.
     *
     * @param {number} [delay=1000]
     * @memberof MockAPI
     */
    replaceGlobalFetch(delay = 1000) {
        if (this.active) {
            return;
        }
        this.active = true;
        this._origFetch = fetch;
        window.fetch = async (url, init = {}) => {
            // Parse the URL first. We only want the pathname
            const parsedURL = new URL(url, "http://dummy.com");
            url = parsedURL.pathname;
            // Make sure the url doesn't start with "/api/v1"
            url = url.startsWith(this.routePrefix)
                ? url.replace(this.routePrefix, "")
                : url;
            let mockResponse;
            if (init.method === "GET") {
                mockResponse = this.apiGET(url);
            } else {
                let body = init.body;
                if (typeof body === "string") {
                    body = JSON.parse(body);
                }
                mockResponse = this.apiPOST(url, body);
            }
            // eslint-disable-next-line
            console.log(
                `MockAPI ${init.method} Request.`,
                url,
                init,
                "Reponding with",
                mockResponse
            );
            // Create a `Response` object to return so that we fully immitate
            // the `fetch` api.
            const responseObj = new Response(
                new Blob([JSON.stringify(mockResponse)], {
                    type: "application/json"
                }),
                { status: 200, statusText: "OK" }
            );
            return new Promise(resolve => {
                window.setTimeout(() => resolve(responseObj), delay);
            });
        };
    }

    /**
     * Restore the global `window.fetch` to what the browser provides.
     * If `window.fetch` has not been overridden, this function does nothing.
     *
     * @memberof MockAPI
     */
    restoreGlobalFetch() {
        this.active = false;
        window.fetch = this._origFetch || fetch;
    }
}

const mockAPI = new MockAPI(mockData);
export { mockAPI, mockData };
