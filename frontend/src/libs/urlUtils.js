/*
 * A collection of utility functions for interfacing with urls
 */

/**
 * Try to parse `s` as a native javascript type. E.g., "45.6" will
 * be parsed as a number, "true" will be parsed as `true`, "[]"
 * will be parsed as an empty array.
 *
 * @param {string} s
 * @returns
 */
function stringToNativeType(s) {
    if (typeof s === "string" && s !== "" && !Number.isNaN(+s)) {
        return +s;
    }
    try {
        return JSON.parse(s);
    } catch (e) {
        return s;
    }
}

function parseURLSearchString(s) {
    const searchParams = new URLSearchParams(s);
    const ret = {};
    for (const [key, val] of searchParams.entries()) {
        ret[key] = stringToNativeType(val);
    }
    return ret;
}

export { stringToNativeType, parseURLSearchString };
