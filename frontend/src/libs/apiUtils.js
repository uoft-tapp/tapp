/*
 * A collection of untilty functions for interfacing with the API
 */

const API_URL = "/api/v1";
const FETCH_INIT = {
    credentials: "same-origin",
    headers: {
        "Content-Type": "application/json"
    }
};

/**
 * Error thrown whenever an api call returns with `status==="error"`
 *
 * @class ApiError
 * @extends {Error}
 */
class ApiError extends Error {
    constructor(resp) {
        const errorMessage = resp.message;
        super(errorMessage);
        Error.captureStackTrace(this, ApiFetchError);
        this.response = resp;
        this.status = resp.status;
    }
}

/**
 * Error thrown whenever an api fetch request
 * returns with a status other than 200
 *
 * @class ApiFetchError
 * @extends {ApiError}
 */
class ApiFetchError extends ApiError {
    constructor(resp, path) {
        const errorMessage = `Got status ${resp.status} ${
            resp.statusText
        } when fetching ${API_URL + path}`;
        super(errorMessage);
        Error.captureStackTrace(this, ApiFetchError);
        this.response = resp;
        this.status = resp.status;
    }
}

// Ensure that `path` starts with a `/`
function _ensurePath(path) {
    return path.starsWith("/") ? path : "/" + path;
}

// Process a `fetch` response from the API.
// Successful responses from the API should be of
// the form `{status: ("success"|"error"), message: "...", payload: ...}.
// Throw an error on a failed HTTP request or a `status === "error"`
// response from the API.
async function _processFetchResponse(resp, path) {
    if (resp.status === 200) {
        const json = await resp.json();
        if (json.status === "error") {
            throw new ApiError(json);
        }
        return resp.payload;
    }
    // if we made it this far, there was a bad status
    // returned during fetch
    throw new ApiFetchError(resp, path);
}

/**
 * Do a GET requestion on the specified api route
 *
 * @param {string} path
 * @returns {Promise<object>} Promise containing the processed JSON response
 */
async function apiGET(path) {
    // remove a leading "/" if there is one in `path`
    path = _ensurePath(path);
    try {
        const resp = await fetch(API_URL + path, {
            ...FETCH_INIT,
            method: "GET"
        });
        return await _processFetchResponse(resp, path);
    } catch (e) {
        throw e;
    }
}

/**
 * Do a POST requestion on the specified api route
 *
 * @param {string} path
 * @param {object} [body={}]
 * @returns {Promise<object>} Promise containing the processed JSON response
 */
async function apiPOST(path, body = {}) {
    // remove a leading "/" if there is one in `path`
    path = _ensurePath(path);
    try {
        const resp = await fetch(API_URL + path, {
            ...FETCH_INIT,
            method: "POST",
            body: JSON.stringify(body)
        });
        return await _processFetchResponse(resp, path);
    } catch (e) {
        throw e;
    }
}

export { API_URL, ApiError, ApiFetchError, apiGET, apiPOST };
