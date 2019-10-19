import Route from "route-parser";
import { mockData } from "./data";
import { sessionsRoutes } from "./sessions";

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
    getRoutes = Object.assign({}, sessionsRoutes.get, {
        "/all_data": data => data,
        "/instructors": data => data.instructors,
        "/available_position_templates": data => [
            ...data.available_position_templates
        ],
        "/sessions/:session_id/positions": (data, params) => [
            ...data.positions[params.session_id]
        ],
        "/sessions/:session_id/assignments": (data, params) => [
            ...data.assignments[params.session_id]
        ],
        "/sessions/:session_id/position_templates": (data, params) => [
            ...data.position_templates_by_session[params.session_id]
        ],
        "/sessions/:session_id/applicants": (data, params) =>
            data.applicants_by_session[params.session_id].map(utorid =>
                pickFromArray(data.applicants, utorid, "utorid")
            )
    });
    postRoutes = Object.assign({}, sessionsRoutes.post, {
        "/instructors": (data, params, body) => {
            // body should be an instructor object. If it contains an id,
            // update an existing session. Otherwise, create a new one.
            const matchingInstructors = data.instructors.filter(
                s => s.id === body.id
            );
            if (matchingInstructors.length > 0) {
                return Object.assign(matchingInstructors[0], body);
            }
            // if we're here, we need to create a new instructor
            // but check if the name is empty
            if (
                (body.first_name == null || body.first_name === "") &&
                (body.last_name == null || body.last_name === "")
            ) {
                throw new Error("Instructor name cannot be empty!");
            }
            if (
                data.instructors.some(
                    s =>
                        (body.utorid && body.utorid === s.utorid) ||
                        (s.first_name === body.first_name &&
                            s.last_name === body.last_name)
                )
            ) {
                throw new Error(
                    `Instructor of same first_name=${body.first_name} last_name=${body.last_name} already exists!`
                );
            }
            // create new instructor
            const newId = Math.floor(Math.random() * 1000);
            const newInstructor = { ...body, id: newId };
            data.instructors.push(newInstructor);
            return newInstructor;
        },
        "/instructors/delete": (data, params, body) => {
            const matchingInstructors = data.instructors.filter(
                s => s.id === body.id
            );
            if (matchingInstructors.length === 0) {
                throw new Error(
                    `Could not find instructor with id=${body.id} to delete`
                );
            }
            // if we found the item with matching id, delete it.
            data.instructors.splice(
                data.instructors.indexOf(matchingInstructors[0]),
                1
            );
            return matchingInstructors[0];
        }
    });

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
            // Make sure the url doesn't start with "/api/v1"
            url = url.replace(this.routePrefix, "");
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
            return new Promise(resolve => {
                window.setTimeout(
                    () =>
                        resolve({
                            status: 200,
                            json: () => Promise.resolve(mockResponse)
                        }),
                    delay
                );
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
