/*
 * A collection of utility functions for interfacing with the API
 */

import { RawPosting, RawSession } from "../api/defs/types";

const API_URL = "/api/v1";
const FETCH_INIT: RequestInit = {
    credentials: "same-origin",
    headers: {
        "Content-Type": "application/json",
    },
};

/**
 * Error thrown whenever an api call returns with `status==="error"`
 *
 * @class ApiError
 * @extends {Error}
 */
class ApiError extends Error {
    response: Partial<Response>;
    status: Response["status"];

    constructor(resp: Pick<Response, "status"> & { message: string }) {
        const errorMessage = resp.message;
        super(errorMessage);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiFetchError);
        }
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
    constructor(resp: Response, path: string) {
        const errorMessage = `Got status ${resp.status} ${
            resp.statusText
        } when fetching ${API_URL + path}`;
        super({ ...resp, message: errorMessage });
    }
}

// Ensure that `path` starts with a `/`
function _ensurePath(path: string) {
    return path.startsWith("/") ? path : "/" + path;
}

// Process a `fetch` response from the API.
// Successful responses from the API should be of
// the form `{status: ("success"|"error"), message: "...", payload: ...}.
// Throw an error on a failed HTTP request or a `status !== "success"`
// response from the API.
async function _processFetchResponse(resp: Response, path: string) {
    if (resp.status === 200) {
        const json = await resp.json();
        if (json.status !== "success") {
            // If we got random JSON instead of {status: ..., message: ..., payload: ...}
            // There will be no `json.message`. Provide a default message that will get
            // overridden in this case
            throw new ApiError({
                message: "Server response did not have `status === 'success`",
                ...json,
            });
        }
        return json.payload;
    }
    // if we made it this far, there was a bad status
    // returned during fetch
    throw new ApiFetchError(resp, path);
}

/**
 * Do a GET request on the specified api route. This function has sophisticated automatic
 * type inference when using Typescript that works on constant string types (e.g., `apiGET("/sessions")`). If you
 * want type inference when using template literals, you must declare the template literal `as const`
 * (e.g. ``apiGET(`/sessions` as const)``).
 *
 * @param path
 * @returns Promise containing the processed JSON response
 * @throws {(ApiError|ApiFetchError|Error)} Throws an error if the fetch fails or returns with `status==="error"`
 */
async function apiGET<Path extends string, Ret = ApiGetReturnType<Path>>(
    path: Path
): Promise<Ret> {
    // remove a leading "/" if there is one in `path`
    path = _ensurePath(path) as Path;
    const resp = await fetch(API_URL + path, {
        ...FETCH_INIT,
        method: "GET",
    });
    return await _processFetchResponse(resp, path);
}

/**
 * Do a POST request on the specified api route
 *
 * @param path
 * @param  [body={}]
 * @returns Promise containing the processed JSON response
 * @throws {(ApiError|ApiFetchError|Error)} Throws an error if the fetch fails or returns with `status==="error"`
 */
async function apiPOST(path: string, body: any = {}) {
    // remove a leading "/" if there is one in `path`
    path = _ensurePath(path);
    const resp = await fetch(API_URL + path, {
        ...FETCH_INIT,
        method: "POST",
        body: JSON.stringify(body),
    });
    return await _processFetchResponse(resp, path);
}

export { API_URL, ApiError, ApiFetchError, apiGET, apiPOST };

// XXX TODO: this is the start of a type system for typing API
// requests. However, it appears not to be usable in TypeScript 4.2 with template literals,
// which we use all over the code. See https://stackoverflow.com/questions/66739139/typescript-infer-temlate-lieral-from-const-template-literal/66739356#66739356
type PathVariable = string;
type ExtractPathVariable<T extends string> = T extends `:${string}`
    ? PathVariable
    : T;
/**
 * A type that breaks `Path` up by `/` characters and leaves any part of
 * the path starting with `:` as a general string. For example,
 * `PathParts<"/sessions/43/posts"> == typeof ["sessions", "43", "posts"]` and
 * `PathParts<"/sessions/:session_id/posts"> == typeof ["sessions", string, "posts"]`.
 *
 * As such, `PathParts<"/sessions/43/posts"> extends PathParts<"/sessions/:session_id/posts">`,
 * and so `PathParts` can be used for Url route matching.
 */
type PathParts<Path extends string> = Path extends `/${infer Rest}`
    ? PathParts<Rest>
    : Path extends `${infer Start}/${infer Rest}`
    ? [ExtractPathVariable<Start>, ...PathParts<`${Rest}`>]
    : Path extends `${infer Item}`
    ? [ExtractPathVariable<Item>]
    : never;

type ApiGetReturnType<
    Url extends string,
    UrlPath = PathParts<Url>
> = UrlPath extends PathParts<"/:role/sessions">
    ? RawSession[]
    : UrlPath extends PathParts<"/:role/sessions/:/postings">
    ? RawPosting[]
    : unknown;
