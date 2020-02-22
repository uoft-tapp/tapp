import axios from "axios";
import PropTypes from "prop-types";
import { apiPropTypes } from "../api/defs/prop-types";
// eslint-disable-next-line
const { expect, test } = global;

// Jest demands there be a test in every file, so we put a no-op test here.
test("no-op", () => {});

/** URL prefix for making API calls from inside a docker image */
export const API_URL = "http://backend:3000/api/v1";

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
    let resp = null;
    try {
        resp = await axios.get(url);
    } catch (e) {
        // Modify the error to display some useful information
        throw new Error(
            `Posting to \`${url}\`\nfailed with error: ${e.message}`
        );
    }
    checkPropTypes(apiResponsePropTypes, resp.data);

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
    let resp = null;
    try {
        resp = await axios.post(url, body);
        checkPropTypes(apiResponsePropTypes, resp.data);
    } catch (e) {
        // Modify the error to display some useful information
        throw new Error(
            `Posting to \`${url}\` with content\n\t${JSON.stringify(
                body
            )}\nfailed with error: ${e.message}`
        );
    }

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
 * Add a position template to a session
 *
 * @export
 * @param {{apiGET: Function, apiPOST: Function}} api api object containing `apiGET` and `apiPOST`
 * @param {{id: number}} session session to add to (must have an `id` attribute)
 * @param {number} [num=1] Number of templates to add
 * @returns
 */
export async function addContractTemplateToSession(api, session, num = 1) {
    // generates position template data
    function generateTemplateData(i = 0) {
        return {
            template_file: `this_is_a_test_template_${i}.html`,
            template_name:
                ["Standard", "OTO", "Invigilate"][i] || `Standard v ${i}`
        };
    }
    let resp = {};
    for (let i = 0; i < num; i++) {
        resp = await api.apiPOST(
            `/admin/sessions/${session.id}/contract_templates`,
            generateTemplateData(i)
        );
    }
    return resp.payload;
}

/**
 * Add a new session
 *
 * @export
 * @param {{apiGET: Function, apiPOST: Function}} api api object containing `apiGET` and `apiPOST`
 * @param {object} [include={ contract_templates: true }] additional objects to create and attach to the session
 * @returns
 */
export async function addSession(api, include = { contract_templates: true }) {
    const newSessionData = {
        start_date: "2019/09/09",
        end_date: "2019/12/31",
        // add a random string to the session name so we don't accidentally collide with another
        // session's name
        name: "Newly Created Sessions (" + Math.random() + ")",
        rate1: 56.54
    };
    let resp = {};
    resp = await api.apiPOST(`/admin/sessions`, newSessionData);
    const session = resp.payload;
    if (include.contract_templates) {
        addContractTemplateToSession(api, session);
    }
    return session;
}

/**
 * Delete a session
 *
 * @export
 * @param {{apiGET: Function, apiPOST: Function}} api api object containing `apiGET` and `apiPOST`
 * @param {{id: number}} session session to add to (must have an `id` attribute)
 * @returns
 */
export async function deleteSession(api, session) {
    const resp = await api.apiPOST(`/admin/sessions/delete`, session);
    return resp.payload;
}

/**
 * Add a new position
 *
 * @export
 * @param {{apiGET: Function, apiPOST: Function}} api api object containing `apiGET` and `apiPOST`
 * @param {{id: number}} session session to add to (must have an `id` attribute)
 * @returns
 */
export async function addPosition(api, session) {
    const newPositionData = {
        position_code: "MAT135F",
        position_title: "Calculus I",
        hours_per_assignment: 70,
        start_date: "2018/05/09",
        end_date: "2018/09/09"
    };
    const resp = await api.apiPOST(
        `/admin/sessions/${session.id}/positions`,
        newPositionData
    );
    return resp.payload;
}

/**
 * Delete a position
 *
 * @export
 * @param {{apiGET: Function, apiPOST: Function}} api api object containing `apiGET` and `apiPOST`
 * @param {{id: number}} position position to be deleted (must have an `id` attribute)
 * @returns
 */
export async function deletePosition(api, position) {
    const resp = await api.apiPOST(`/admin/positions/delete`, position);
    return resp.payload;
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
    if (wasPropTypeErrors) {
        try {
            throw new Error();
        } catch (e) {
            console.warn("Proptypes error call stack:", e.stack);
        }
        throw new Error(
            `Object ${JSON.stringify(data)} failed proptypes check`
        );
    }
}

export const apiResponsePropTypes = apiPropTypes.apiResponse;
export const successPropTypes = apiPropTypes.apiResponseSuccess;
export const errorPropTypes = apiPropTypes.apiResponseError;

export const sessionPropTypes = apiPropTypes.session;

export const offerTemplateMinimalPropTypes =
    apiPropTypes.contractTemplateMinimal;
export const offerTemplatePropTypes = apiPropTypes.contractTemplate;

export const positionPropTypes = apiPropTypes.position;

export const instructorPropTypes = apiPropTypes.instructor;

export const assignmentPropTypes = apiPropTypes.assignment;

export const wageChunkPropTypes = apiPropTypes.wageChunk;

export const reportingTagsPropTypes = apiPropTypes.reportingTags;
