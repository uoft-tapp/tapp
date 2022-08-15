/**
 * A collection of utility functions to help with the mock API
 */

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
                end_date: december.toISOString(),
            },
            {
                start_date: january.toISOString(),
                end_date: end_date.toISOString(),
            },
        ];
    }
    return [
        {
            start_date: start_date.toISOString(),
            end_date: end_date.toISOString(),
        },
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
    const ids = data.map((x) => +x[prop]).filter((x) => x != null);
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
    return data.find((s) => s[prop] == obj[prop]);
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
    ids = ids.map((x) => "" + x);
    return data.filter((x) => ids.includes("" + x[prop]));
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
 * @param {boolean} [props={ name: { required: true, unique: true } }]
 * @returns {string|false} - `false` if all checks succeed. Otherwise an appropriate error message.
 */
export function getAttributesCheckMessage(
    obj,
    data = [],
    props = { id: { required: true, unique: true } }
) {
    for (const [prop, requirements] of Object.entries(props)) {
        // Required attributes cannot be null or the empty string
        // Note: `== null` check null and undefined
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

/**
 * Base class for mockAPI controllers. These handle
 * the mockAPI data and queries thereof.
 *
 * @export
 * @class MockAPIController
 */
export class MockAPIController {
    constructor(data, ownData) {
        this.data = data;
        this.ownData = ownData;
    }
    /**
     * Finds all instances of the given item; returns an array copy.
     *
     * @returns {object[]}
     * @memberof MockAPIController
     */
    // eslint-disable-next-line
    findAll(...args) {
        return [...this.ownData];
    }
    /**
     * Finds a single instance of an item
     *
     * @param {({id: number}|number)} query
     * @returns {object}
     * @memberof MockAPIController
     */
    find(query) {
        return this.rawFind(query);
    }
    /**
     * Not to be overridden. The return value of this object
     * must be an unmangled version of the actual data stored (so that it can be
     * mutated, for example.)
     *
     * @param {*} query
     * @returns
     * @memberof MockAPIController
     */
    rawFind(query) {
        if (query == null) {
            return null;
        }
        if (query.id != null) {
            return find(query, this.ownData);
        }
        if (query.utorid != null) {
            return find({ utorid: query }, this.ownData);
        }
        return find({ id: query }, this.ownData);
    }
    /**
     * Delete the given object (by id).
     *
     * @param {{id: number}} obj
     * @memberof MockAPIController
     */
    delete(obj) {
        obj = this.rawFind(obj);
        if (!obj) {
            throw new Error(`Cannot delete object ${JSON.stringify(obj)}`);
        }
        deleteInArray(obj, this.ownData);
        return obj;
    }
    /**
     * Get an unused ID
     *
     * @returns {number}
     * @memberof MockAPIController
     */
    unusedId() {
        if (!this.ownData) {
            throw new Error(
                "Cannot get unused ID when `ownData` hasn't been set"
            );
        }
        return getUnusedId(this.ownData);
    }
    /**
     * Creates a new item instance; no validation is performed.
     *
     * @param {object} obj - the new instance data
     * @memberof MockAPIController
     */
    create(obj) {
        const newId = getUnusedId(this.ownData);
        const newItem = { ...obj, id: newId };
        this.ownData.push(newItem);
        return newItem;
    }
    /**
     * Validates the properties of a new item instance. Throws an error
     * if the properties are invalid/incompatable.
     *
     * @param {object} obj
     * @memberof MockAPIController
     */
    // eslint-disable-next-line
    validateNew(obj) {
        throw new Error("Subclasses must implement `validateNew()`");
    }

    /**
     * Validates a property of an item instance. Throws an error
     * if this property are invalid/incompatable.
     *
     * @param {object} obj
     * @param {string} prop
     * @memberof MockAPIController
     */
    // eslint-disable-next-line no-unused-vars
    validateProp(prop, value, id) {
        return true;
    }
    /**
     * Update an item if it can be found. Otherwise, return null.
     *
     * @param {*} obj
     * @returns {(object|null)}
     * @memberof MockAPIController
     */
    updateIfFound(obj) {
        const item = this.rawFind(obj);
        if (!item) {
            return null;
        }
        // We've found a matching item. Update all non-null
        // properties
        for (const prop in obj) {
            if (prop != null) {
                this.validateProp(prop, obj[prop], obj.id);
                item[prop] = obj[prop];
            }
        }
        return item;
    }
    /**
     * Upsert an item. `validateNew` will be run on the item before it is created.
     * Null/undefined parameters will not be updated.
     *
     * @param {object} obj
     * @returns {object}
     * @memberof MockAPIController
     */
    upsert(obj) {
        if (this.rawFind(obj)) {
            return this.updateIfFound(obj);
        }
        this.validateNew(obj);
        return this.create(obj);
    }
}

/**
 * Extract the earliest start date and latest end date from
 * an array of wage chunks.
 *
 * @export
 * @param {[object]} wageChunks
 * @returns {{start_date: date, end_date: date}}
 */
export function wageChunkArrayToStartAndEndDates(wageChunks) {
    const startDates = wageChunks.map((x) => x.start_date);
    const endDates = wageChunks.map((x) => x.end_date);
    startDates.sort();
    endDates.sort();
    return {
        start_date: startDates[0],
        end_date: endDates[endDates.length - 1],
    };
}

/**
 * Join an array of strings with the conjunction "and", if suitable.
 *
 * @param {[string]} items
 * @returns {string}
 */
function joinWithConjunction(items) {
    if (items == null || items.length === 0) {
        return "";
    }
    if (items.length === 1) {
        return items[0];
    }
    if (items.length === 2) {
        return `${items[0]} and ${items[1]}`;
    }
    items = [...items];
    items[items.length - 1] = "and " + items[items.length - 1];
    return items.join(", ");
}

/**
 * Format a list of instructors to appear in a contract.
 *
 * @export
 * @param {[object]} instructors
 * @returns {string}
 */
export function formatInstructorsContact(instructors) {
    if (!instructors) {
        return [];
    }
    const contacts = instructors.map(
        (x) => `${x.first_name} ${x.last_name} <${x.email}>`
    );
    return joinWithConjunction(contacts);
}

/**
 * Take an array of wage chunks and create a formatted string describing every separate
 * pay period. If there are multiple wage chunks with the same rate, their hours are combined
 * and the pay window is made large enough to contain those chunks.
 *
 * @export
 * @param {[object]} wageChunks
 * @returns {string}
 */
export function wageChunkArrayToPayPeriodDescription(wageChunks) {
    // Every different pay rate needs to be explained separately
    // So first make a hash based on pay rates
    const rateData = {};
    for (const wageChunk of wageChunks) {
        let { rate, start_date, end_date, hours } = wageChunk;
        start_date = new Date(start_date);
        end_date = new Date(end_date);
        rateData[rate] = rateData[rate] || { hours: 0, rate };
        const data = rateData[rate];
        data.hours += hours;
        data.start_date = data.start_date || start_date;
        data.start_date = Math.min(data.start_date, start_date);
        data.end_date = data.end_date || end_date;
        data.end_date = Math.max(data.end_date, end_date);
    }
    const descriptions = Object.values(rateData).map(
        ({ hours, rate, start_date, end_date }) => {
            start_date = new Date(start_date);
            end_date = new Date(end_date);

            return `${hours} hours at $${rate}/hour from ${start_date.toLocaleDateString(
                "EN-ca",
                { month: "long", day: "numeric", year: "numeric" }
            )} to ${end_date.toLocaleDateString("EN-ca", {
                month: "long",
                day: "numeric",
                year: "numeric",
            })}`;
        }
    );

    return joinWithConjunction(descriptions);
}

/**
 * Return a copy of `obj` but filter out any properties whose value
 * is `null` or `undefined`.
 *
 * @export
 * @param {*} obj
 * @returns
 */
export function filterNullProps(obj) {
    const ret = {};
    for (const key in obj) {
        if (obj[key] != null) {
            ret[key] = obj[key];
        }
    }
    return ret;
}

export function errorUnlessRole({ role }, targetRule = "admin") {
    if (role !== targetRule) {
        throw new Error(`Invalid route for user with role '${role}'`);
    }
}

/**
 * Recursively traverse the object `obj` and delete any property with key `prop`.
 *
 * @export
 * @param {*} obj
 * @param {string} [prop="id"]
 * @returns
 */
export function recursiveDeleteProp(obj, prop = "id") {
    if (typeof obj != "object" || obj == null) {
        return;
    }
    if (Array.isArray(obj)) {
        for (const elm of obj) {
            recursiveDeleteProp(elm, prop);
        }
        return;
    }
    delete obj[prop];
    for (const elm of Object.values(obj)) {
        recursiveDeleteProp(elm, prop);
    }
}

//
// Base64 Encoding functions from
// https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727
//

/*
MIT License
Copyright (c) 2020 Egor Nepomnyaschih
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
// This constant can also be computed with the following algorithm:
const base64abc = [],
	A = "A".charCodeAt(0),
	a = "a".charCodeAt(0),
	n = "0".charCodeAt(0);
for (let i = 0; i < 26; ++i) {
	base64abc.push(String.fromCharCode(A + i));
}
for (let i = 0; i < 26; ++i) {
	base64abc.push(String.fromCharCode(a + i));
}
for (let i = 0; i < 10; ++i) {
	base64abc.push(String.fromCharCode(n + i));
}
base64abc.push("+");
base64abc.push("/");
*/
const base64abc =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(
        ""
    );

// This constant can also be computed with the following algorithm:
const l = 256,
    base64codes = new Uint8Array(l);
for (let i = 0; i < l; ++i) {
    base64codes[i] = 255; // invalid character
}
base64abc.forEach((char, index) => {
    base64codes[char.charCodeAt(0)] = index;
});
base64codes["=".charCodeAt(0)] = 0; // ignored anyway, so we just need to prevent an error
//const base64codes = [
//	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
//	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
//	255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 62, 255, 255, 255, 63,
//	52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 255, 255, 255, 0, 255, 255,
//	255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
//	15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255,
//	255, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
//	41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
//];

function getBase64Code(charCode) {
    if (charCode >= base64codes.length) {
        throw new Error("Unable to parse base64 string.");
    }
    const code = base64codes[charCode];
    if (code === 255) {
        throw new Error("Unable to parse base64 string.");
    }
    return code;
}

export function bytesToBase64(bytes) {
    let result = "",
        i,
        l = bytes.length;
    for (i = 2; i < l; i += 3) {
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
        result += base64abc[bytes[i] & 0x3f];
    }
    if (i === l + 1) {
        // 1 octet yet to write
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[(bytes[i - 2] & 0x03) << 4];
        result += "==";
    }
    if (i === l) {
        // 2 octets yet to write
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[(bytes[i - 1] & 0x0f) << 2];
        result += "=";
    }
    return result;
}

export function base64ToBytes(str) {
    if (str.length % 4 !== 0) {
        throw new Error("Unable to parse base64 string.");
    }
    const index = str.indexOf("=");
    if (index !== -1 && index < str.length - 2) {
        throw new Error("Unable to parse base64 string.");
    }
    let missingOctets = str.endsWith("==") ? 2 : str.endsWith("=") ? 1 : 0,
        n = str.length,
        result = new Uint8Array(3 * (n / 4)),
        buffer;
    for (let i = 0, j = 0; i < n; i += 4, j += 3) {
        buffer =
            (getBase64Code(str.charCodeAt(i)) << 18) |
            (getBase64Code(str.charCodeAt(i + 1)) << 12) |
            (getBase64Code(str.charCodeAt(i + 2)) << 6) |
            getBase64Code(str.charCodeAt(i + 3));
        result[j] = buffer >> 16;
        result[j + 1] = (buffer >> 8) & 0xff;
        result[j + 2] = buffer & 0xff;
    }
    return result.subarray(0, result.length - missingOctets);
}

export function base64encode(str, encoder = new TextEncoder()) {
    return bytesToBase64(encoder.encode(str));
}

export function base64decode(str, decoder = new TextDecoder()) {
    return decoder.decode(base64ToBytes(str));
}
