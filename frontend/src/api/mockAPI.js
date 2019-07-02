import Route from "route-parser";

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
    getRoutes = {
        "/all_data": data => data,
        "/sessions": data => data.sessions,
        "/instructors": data => data.instructors,
        "/available_position_templates": data =>
            data.available_position_templates,
        "/sessions/:session_id/positions": (data, params) =>
            data.positions[params.session_id],
        "/sessions/:session_id/assignments": (data, params) =>
            data.assignments[params.session_id],
        "/sessions/:session_id/position_templates": (data, params) =>
            data.position_templates_by_session[params.session_id],
        "/sessions/:session_id/applicants": (data, params) =>
            data.applicants_by_session[params.session_id].map(utorid =>
                pickFromArray(data.applicants, utorid, "utorid")
            )
    };

    constructor(seedData) {
        this.active = false;
        this.data = seedData;
        this._getRoutesParsers = Object.keys(this.getRoutes).map(
            routeStr => new Route(routeStr)
        );
    }

    apiGET(url) {
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
    }

    apiPOST(url, body) {
        return {
            status: "error",
            message: "Posting to the mock API is not yet implemented"
        };
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

export const mockData = {
    sessions: [
        {
            id: 1,
            start_date: "2019-09-08T00:00:00.000Z",
            end_date: "2019-12-31T00:00:00.000Z",
            name: "2019 Fall",
            rate1: 45.55,
            rate2: 47.33
        },
        {
            id: 2,
            start_date: "2020-01-01T00:00:00.000Z",
            end_date: "2020-04-30T00:00:00.000Z",
            name: "2020 Spring",
            rate1: 45.55,
            rate2: null
        }
    ],
    available_position_templates: [
        { offer_template: "/math/default.html" },
        { offer_template: "/math/default2018.html" },
        { offer_template: "/math/invigilate.html" },
        { offer_template: "/math/invigilate2014.html" },
        { offer_template: "/math/oto.html" }
    ],
    position_templates_by_session: {
        1: [
            { position_type: "standard", offer_template: "/math/default.html" },
            { position_type: "oto", offer_template: "/math/oto.html" }
        ],
        2: [
            {
                position_type: "standard",
                offer_template: "/math/default2018.html"
            },
            {
                position_type: "invigilate",
                offer_template: "/math/invigilate.html"
            }
        ]
    },
    instructors: [
        {
            id: 1000,
            last_name: "Smith",
            first_name: "Henry",
            email: "hery.smith@utoronto.ca",
            utorid: "smithh"
        },
        {
            id: 1001,
            last_name: "Garcia",
            first_name: "Emily",
            email: "emily.garcia@utoronto.ca",
            utorid: "garciae"
        },
        {
            id: 1002,
            last_name: "Miller",
            first_name: "Megan",
            email: "megan.miller@utoronto.ca",
            utorid: "millerm"
        },
        {
            id: 1003,
            last_name: "Beera",
            first_name: "Lizzy",
            email: "lizzy.beera@utoronto.ca",
            utorid: "beeral"
        }
    ],
    positions: {
        1: [
            {
                id: 10,
                position_code: "MAT135H1F",
                position_title: "Calculus I",
                est_hours_per_assignment: 70,
                est_start_date: "2019-09-08T00:00:00.000Z",
                est_end_date: "2019-12-31T00:00:00.000Z",
                position_type: "standard",
                duties: "Tutorials",
                qualifications: "Teaching skill",
                ad_hours_per_assignment: 70,
                ad_num_assignments: 15,
                ad_open_date: "2019-08-01T00:00:00.000Z",
                ad_close_date: "2019-08-15T00:00:00.000Z",
                desired_num_assignments: 15,
                current_enrollment: 1200,
                current_waitlisted: 200,
                instructors: ["smithh", "garciae"]
            },
            {
                id: 11,
                position_code: "MAT136H1F",
                position_title: "Calculus II",
                est_hours_per_assignment: 70,
                est_start_date: "2019-09-08T00:00:00.000Z",
                est_end_date: "2019-12-31T00:00:00.000Z",
                position_type: "invigilation",
                instructors: []
            }
        ],
        2: [
            {
                id: 12,
                position_code: "CSC135H1F",
                position_title: "Computer Fun",
                est_hours_per_assignment: 70,
                est_start_date: "2019-09-08T00:00:00.000Z",
                est_end_date: "2019-12-31T00:00:00.000Z",
                position_type: "standard",
                duties: "Tutorials",
                instructors: ["smithh"]
            },
            {
                id: 13,
                position_code: "MAT235H1F",
                position_title: "Calculus III",
                est_hours_per_assignment: 70,
                est_start_date: "2019-09-08T00:00:00.000Z",
                est_end_date: "2019-12-31T00:00:00.000Z",
                position_type: "invigilation",
                instructors: ["millerm"]
            }
        ]
    },
    applicants_by_session: {
        1: ["weasleyr", "potterh", "smithb", "howeyb", "brownd"],
        2: ["smithb", "wilsonh", "molinat"]
    },
    applicants: [
        {
            id: 2000,
            utorid: "weasleyr",
            student_number: "89013443",
            first_name: "Ron",
            last_name: "Weasley",
            email: "ron@potter.com",
            phone: "543-223-9993"
        },
        {
            id: 2001,
            utorid: "potterh",
            student_number: "999666999",
            first_name: "Harry",
            last_name: "Potter",
            email: "harry@potter.com"
        },
        {
            id: 2002,
            utorid: "smithb",
            email: "smithb@mail.utoronto.ca",
            first_name: "Bethany",
            last_name: "Smith",
            student_number: "131382748"
        },
        {
            id: 2003,
            utorid: "wilsonh",
            email: "wilsonh@mail.utoronto.ca",
            first_name: "Hanna",
            last_name: "Wilson",
            student_number: "600366904"
        },
        {
            id: 2004,
            utorid: "molinat",
            email: "molinat@mail.utoronto.ca",
            first_name: "Troy",
            last_name: "Molina",
            student_number: "328333023"
        },
        {
            id: 2005,
            utorid: "howeyb",
            email: "howeyb@mail.utoronto.ca",
            first_name: "Brett",
            last_name: "Howey",
            student_number: "329613524"
        },
        {
            id: 2006,
            utorid: "brownd",
            email: "brownd@mail.utoronto.ca",
            first_name: "David",
            last_name: "Brown",
            student_number: "29151485"
        }
    ],
    assignments: {
        1: [
            {
                id: 100,
                position_id: 10,
                applicant_id: 2001,
                hours: 90
            },
            {
                id: 101,
                position_id: 10,
                applicant_id: 2003,
                hours: 95
            }
        ],
        2: []
    }
};

export const mockAPI = new MockAPI(mockData);
