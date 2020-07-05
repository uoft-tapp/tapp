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

/**
 * Formats the input date string to be human readable
 * Input string is of the form 2019-01-01T00:00:00.000Z
 * Output string is of the form January 1, 2019
 * @param {string} dateString
 */
export function formatDate(dateString) {
    if (!dateString) {
        return dateString;
    }
    // Normalize the date string so we can compensate for timezone issues.
    // This string is now formatted YYYY-MM-DD
    const normalizedDateString = new Date(dateString).toJSON().slice(0, 10);
    // Add timezone offset information so that Javascript will
    // interpret the date in the current timezone
    const date = new Date(`${normalizedDateString}T00:00:00.000`);
    return `${date.toLocaleDateString("en-CA", {
        month: "short",
        year: "numeric",
        day: "numeric",
    })}`;
}
