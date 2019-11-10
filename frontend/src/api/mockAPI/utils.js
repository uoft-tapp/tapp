/**
 * A collection of untility functions to help with the mock API
 */

/**
 * Adds the arguments passed in.
 *
 * @export
 * @param {} numbers
 * @returns {number}
 */
export function sum(...numbers) {
    let ret = 0;
    for (const num of numbers) {
        ret += +num;
    }
    return ret;
}

/**
 * Given a date range, returns an array of one or two ranges depending
 * on whether the date range includes a new-years.
 *
 * @export
 * @param {(string|Date)} start_date
 * @param {(string|Date)} end_date
 * @returns {{start_date: string, end_date:string}[]}
 */
export function splitDateRangeAtNewYear(start_date, end_date) {
    start_date = new Date(start_date);
    end_date = new Date(end_date);
    // For `Date`, 11 is december
    const december = new Date(start_date.getFullYear(), 11, 31);
    // For `Date`, 12 will be the first month of the subsequent year
    const january = new Date(start_date.getFullYear(), 12, 1);
    if (start_date <= december && end_date > december) {
        return [
            {
                start_date: start_date.toISOString(),
                end_date: december.toISOString()
            },
            {
                start_date: january.toISOString(),
                end_date: end_date.toISOString()
            }
        ];
    }
    return [
        {
            start_date: start_date.toISOString(),
            end_date: end_date.toISOString()
        }
    ];
}

/**
 * Generates an unused Id based on the `prop` attribute.
 *
 * @export
 * @param {object[]} data - array of data with `prop` attributes
 * @param {string} [prop="id"] - attribute to key on
 * @returns {number|string}
 */
export function getUnusedId(data, prop = "id") {
    const ids = data.map(x => +x[prop]).filter(x => x != null);
    const max = Math.max(0, ...ids);
    if (isNaN(max)) {
        // Somehow there was some other type mixed in with the ids. In this case,
        // generate a random string
        return "id-" + Math.round(Math.random() * 10000);
    }
    return max + 1;
}

/**
 * Find `obj` in `data` based on a matching attribute of `prop`.
 * Returns matching object or `undefined` if no match was found.
 *
 * @export
 * @param {*} obj
 * @param {*} [data=[]]
 * @param {string} [prop="id"]
 * @returns {undefined|object}
 */
export function find(obj, data = [], prop = "id") {
    // We really do want to use `==` and not `===` here.
    // Sometimes ids are given as ints and sometimes as strings;
    // we should work interchangibly with both.
    // eslint-disable-next-line
    return data.find(s => s[prop] == obj[prop]);
}

/**
 * Filter `data` to be a list which only includes items
 * with ids listed in `ids`.
 *
 * @export
 * @param {string[]} [ids=[]]
 * @param {object[]} [data=[]]
 * @param {string} [prop="id"]
 * @returns {object[]}
 */
export function findAllById(ids = [], data = [], prop = "id") {
    // ids can be numbers or strings; make sure we get a match in either case.
    ids = ids.map(x => "" + x);
    return data.filter(x => ids.includes("" + x[prop]));
}

/**
 * Delete the first occurance of `obj` in `data`
 *
 * @export
 * @param {*} obj
 * @param {*} [data=[]]
 */
export function deleteInArray(obj, data = []) {
    data.splice(data.indexOf(obj), 1);
}

/**
 * Verify whether attributes are nonempty/unique. If they fail these
 * checks, return an appropriate error message. If they pass, return `false`.
 *
 * @export
 * @param {object} obj
 * @param {object[]} [data=[]]
 * @param {boolean} [props={ id: { required: true, unique: true } }]
 * @returns {string|boolean} - `false` if all checks succeed. Otherwise an appropriate error message.
 */
export function getAttributesCheckMessage(
    obj,
    data = [],
    props = { id: { required: true, unique: true } }
) {
    for (const [prop, requirements] of Object.entries(props)) {
        // Required attributes cannot be null or the empty string
        if (requirements.required && (obj[prop] == null || obj[prop] === "")) {
            return `Property ${prop} cannot be empty`;
        }
        // Search the data for something with a matching prop. If we find
        // anything, we are not unique
        if (requirements.unique && find(obj, data, prop)) {
            return `Duplicate entry exists for property ${prop} with value ${obj[prop]}`;
        }
    }
    return false;
}
