import axios from "axios";
import PropTypes from "prop-types";
// eslint-disable-next-line
const { expect, test } = global;

// Jest demands there be a test in every file, so we put a no-op test here.
test("no-op", () => {});

/** URL prefix for making API calls from inside a docker image */
export const API_URL = "http://api:3000/api/v1";

// Ensure that `path` starts with a `/`
function _ensurePath(path) {
    return path.startsWith("/") ? path : "/" + path;
}

/**
 * Make a GET request to the api route specified by `url`.
 * `url` should *not* be prefixed (e.g., just "/sessions", not "/api/v1/sessiosn")
 *
 * @export
 * @param {string} url The api un-prefixed url route (e.g. "/sessions")
 * @returns
 */
export async function apiGET(url) {
    url = API_URL + _ensurePath(url);
    const resp = await axios.get(url);
    isApiSuccessResponse(resp);

    // by this point, we have a valid response, so
    // just return the payload
    return resp.data;
}

/**
 * Make a POST request to the api route specified by `url`.
 * `url` should *not* be prefixed (e.g., just "/sessions", not "/api/v1/sessiosn")
 *
 * @export
 * @param {string} url The api un-prefixed url route (e.g. "/sessions")
 * @param {object} body The body of the post request -- `JSON.stringify` will be called on this object.
 * @returns
 */
export async function apiPOST(url, body = {}) {
    url = API_URL + _ensurePath(url);
    const resp = await axios.post(url, body);
    isApiSuccessResponse(resp);

    // by this point, we have a valid response, so
    // just return the payload
    return resp.data;
}

/**
 * Test whether the axios response `response`
 * conforms to the standard api success response
 *
 * @export
 * @param {object} response An axios response
 */
export function isApiSuccessResponse(response) {
    const { status, data } = response;
    expect(status).toEqual(200);
    expect(data.status).toEqual("success");
}

/**
 * Test whether the axios response `response`
 * conforms to the standard api error response
 *
 * @export
 * @param {object} response An axios response
 */
export function isApiErrorResponse(response) {
    const { status, data } = response;
    if (status === 200) {
        expect(data.status).toEqual("error");
        expect(data.message.length > 0).toBe(true);
    }
}

/**
 * Checks that `data` conforms to the prop types
 * specified by `propTypes`.
 *
 * @export
 * @param {PropTypes} propTypes
 * @param {object} data
 */
export function checkPropTypes(propTypes, data) {
    let wasPropTypeErrors = false;
    PropTypes.checkPropTypes(
        { "<root>": propTypes },
        { "<root>": data },
        "PropType verification",
        "the client",
        () => {
            wasPropTypeErrors = true;
        }
    );
    expect(wasPropTypeErrors).toBe(false);
}

export const sessionPropTypes = PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    name: PropTypes.string
});

export const offerTemplateMinimalPropTypes = PropTypes.shape({
    offer_template: PropTypes.string
});

export const offerTemplatePropTypes = PropTypes.shape({
    offer_template: PropTypes.string,
    position_type: PropTypes.string
});
