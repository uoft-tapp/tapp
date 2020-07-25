/**
 * Capitalizes the input string. The function only capitalizes the first word if there are multiple words in the input string.
 * If `word` isn't a srting, it is coerced.
 * @param word a single word.
 * @returns
 */
export function capitalize(word: string | null | undefined): string {
    if (!word) {
        return "";
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Trims the input string. If the `x` is not a string, it is
 * coerced
 *
 * @param {string} x
 * @returns
 */
export function strip(x: string | null | undefined): string {
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
export function formatDate(dateString: string): string {
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

/**
 * Format a url for downloading. In production, this is the
 * identity function. In development mode, this function replaces
 * port `8000` with `3000` so that non-json data can be downloaded from the
 * backend.
 *
 * @param {string} url
 */
let formatDownloadUrl = (url: string) => url;
if (process.env.REACT_APP_DEV_FEATURES) {
    formatDownloadUrl = (url: string) => {
        url = new URL(url, window.location.href).href;
        return url.replace("localhost:8000", "localhost:3000");
    };
}

export { formatDownloadUrl };
