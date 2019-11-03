/**
 * Trims the input string. If the `x` is not a string, it is
 * coerced
 *
 * @param {string} x
 * @returns
 */
export function strip(x) {
    if (x == null) {
        return "";
    }
    return ("" + x).trim();
}
