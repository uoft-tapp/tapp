import Route from "route-parser";
import { mockData } from "./data";
import { sessionsRoutes } from "./sessions";
import { templatesRoutes } from "./contract_templates";
import { positionsRoutes } from "./positions";
import { instructorsRoutes } from "./instructors";
import { documentCallback } from "../defs/doc-generation";
import { assignmentsRoutes } from "./assignments";
import { applicantsRoutes } from "./applicants";
import { applicationsRoutes } from "./applications";
import { wageChunkRoutes } from "./wage_chunks";
import { debugRoutes } from "./debug";
import { activeUserRoutes, User } from "./active_user";
import { ddahsRoutes } from "./ddahs";
import { reportingTagRoutes } from "./reportingTags";
import { postingRoutes } from "./postings";

/**
 * Mock API server that runs locally; useful for demo purposes.
 *
 * @module
 */

export class MockAPI {
    routePrefix = "/api/v1";
    // a list of selectors for each route
    getRoutes = Object.assign(
        {},
        sessionsRoutes.get,
        templatesRoutes.get,
        positionsRoutes.get,
        instructorsRoutes.get,
        assignmentsRoutes.get,
        applicantsRoutes.get,
        applicationsRoutes.get,
        wageChunkRoutes.get,
        ddahsRoutes.get,
        reportingTagRoutes.get,
        debugRoutes.get,
        activeUserRoutes.get,
        postingRoutes.get,
        {
            "/all_data": documentCallback({
                func: (data) => data,
                exclude: true,
            }),
        }
    );
    postRoutes = Object.assign(
        {},
        sessionsRoutes.post,
        templatesRoutes.post,
        positionsRoutes.post,
        instructorsRoutes.post,
        assignmentsRoutes.post,
        applicantsRoutes.post,
        applicationsRoutes.post,
        wageChunkRoutes.post,
        ddahsRoutes.post,
        reportingTagRoutes.post,
        debugRoutes.post,
        activeUserRoutes.post,
        postingRoutes.post
    );

    constructor(seedData) {
        this.active = false;
        this.data = seedData;
        this._getRoutesParsers = Object.keys(this.getRoutes).map((routeStr) => {
            // We want to peel of the role from the start of the route, but we don't want
            // to consider it part of the route for documentation purposes. Since `routeStr`
            // is used to find the callback of the route, we hack `Route` so that `spec`
            // is the same as `routeStr`.
            const r = new Route("(/:role)" + routeStr);
            r.spec = routeStr;
            return r;
        });
        this._postRoutesParsers = Object.keys(this.postRoutes).map(
            (routeStr) => {
                // We want to peel of the role from the start of the route, but we don't want
                // to consider it part of the route for documentation purposes. Since `routeStr`
                // is used to find the callback of the route, we hack `Route` so that `spec`
                // is the same as `routeStr`.
                const r = new Route("(/:role)" + routeStr);
                r.spec = routeStr;
                return r;
            }
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
    apiGET = (url) => {
        for (const route of this._getRoutesParsers) {
            const match = route.match(url);
            // if we have a match, run the selector with the parsed data
            if (match) {
                try {
                    this.authenticateActiveUserBasedOnRole(match.role);
                    const payload = this.getRoutes[route.spec](
                        this.data,
                        match
                    );

                    return {
                        status: "success",
                        message: "",
                        payload,
                    };
                } catch (e) {
                    return { status: "error", message: e.toString() };
                }
            }
        }
        return {
            status: "error",
            message: `could not find route matching ${url}`,
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
                    this.authenticateActiveUserBasedOnRole(match.role);
                    const payload = this.postRoutes[route.spec](
                        this.data,
                        match,
                        body
                    );
                    return {
                        status: "success",
                        message: "",
                        payload,
                    };
                } catch (e) {
                    return { status: "error", message: e.toString() };
                }
            }
        }
        return {
            status: "error",
            message: `could not find route matching ${url}`,
        };
    };

    /**
     * Authenticates the `active_user` as having the role `role`.
     * If the user is not authenticated, an error is thrown.
     *
     * @param {string} role
     * @returns
     * @memberof MockAPI
     */
    authenticateActiveUserBasedOnRole(role) {
        if (role == null) {
            return;
        }
        const active_user = new User(this.data).getActiveUser();
        if (active_user == null) {
            return;
        }
        if (!active_user.roles.includes(role)) {
            throw new Error(
                `Not authenticated for accessing routes with prefix /${role}`
            );
        }
    }

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
                "Responding with",
                mockResponse
            );
            // Create a `Response` object to return so that we fully imitate
            // the `fetch` api.
            const responseObj = new Response(
                new Blob([JSON.stringify(mockResponse)], {
                    type: "application/json",
                }),
                { status: 200, statusText: "OK" }
            );
            return new Promise((resolve) => {
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
