// for json containing object data, we do not need another helper function
// to convert undefined to null since in dataToFile function in "./data-to-file"
// we use JSON.stringify() which will do the conversion

/**
 * Util functions to turn undefined to null for spreadsheets
 *
 * @exports
 * @param {(number | string | null | undefined) [][] item
 * @returns{(number | string | null) [][]}
 */
export function spreadsheetUndefinedToNull(
    items: (number | string | null | undefined)[][]
) {
    return items.map((item) => item.map((val) => val ?? null));
}
