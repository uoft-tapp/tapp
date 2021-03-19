/**
 * Util functions to turn undefined to null for json
 *
 * @exports
 * @param {Object} item
 * @returns{Object}
 */
export function jsonUndefinedToNull(items) {
    const newItems = items.map(function (item) {
        for (const key of Object.keys(item)) {
            item[key] = item[key] ?? null;
        }
        return item;
    });
    return newItems;
}

/**
 * Util functions to turn undefined to null for spreadsheets
 *
 * @exports
 * @param {Object} item
 * @returns{Object}
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
