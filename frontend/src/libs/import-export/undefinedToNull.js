// for json containing object data, we do not need another helper function
// to convert undefined to null since in dataToFile function in "./data-to-file" 
// we use JSON.stringify which will do the conversion

/**
 * Util functions to turn undefined to null for spreadsheets
 *
 * @exports
 * @param {(number | string | null) [][] item
 * @returns{(number | string | null | undefined) [][]}
 */
export function spreadsheetUndefinedToNull(items) {
    const newItems = items.map(function (item) {
        let newItem = item.map(function (val) {
            return val ?? null;
        });
        return newItem;
    });
    return newItems;
}
