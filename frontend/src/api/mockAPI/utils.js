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
    findAll() {
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
    validateNew() {
        throw new Error("Subclasses must impliment `validateNew()`");
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
    validateProp(obj, prop) {
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
                this.validateProp(obj, prop);
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
