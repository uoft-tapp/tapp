/*
 * A collection of utility functions for dealing with imported data (e.g., spreadsheets
 * and JSON files).
 */
import FuzzySet from "fuzzyset";
import XLSX from "xlsx";
import chrono from "chrono-node";

/**
 * Validates `data` based on the specified `schema`. At the moment this
 * function only checks that every key specified by `schema.requiredKeys` is
 * non-null.
 *
 * @export
 * @param {*} data
 * @param {*} schema
 */
export function validate(data, schema) {
    const { requiredKeys } = schema;
    for (const item of data) {
        for (const key of requiredKeys) {
            if (item[key] == null) {
                throw new Error(
                    `Item "${JSON.stringify(
                        item
                    )}" missing required property "${key}"`
                );
            }
        }
    }
}

/**
 * Delete all properties from `keyMap` that have `value` as
 * their value. This function mutates `keyMap`.
 *
 * @param {*} value
 * @param {*} keyMap
 * @returns
 */
function deleteReferences(value, keyMap) {
    for (const key in keyMap) {
        if (keyMap[key] === value) {
            delete keyMap[key];
        }
    }
    return keyMap;
}

/**
 * Do fuzzy matching looking for the best approximation of
 * `keyMap[targetKey]`. E.g., if `keyMap = { foo: "bar" }`,
 * then `findMatchingKey("Foo", keyMap)` would return `"bar"`.
 *
 * If no fuzzy match is found, `null` is returned.
 *
 * @param {*} targetKey
 * @param {*} [keyMap={}]
 * @returns {string | null}
 */
export function findMatchingKey(targetKey, keyMap = {}) {
    if (targetKey in keyMap) {
        return keyMap[targetKey];
    }
    const fuzzySet = FuzzySet(Object.keys(keyMap));
    // We set a 70% match threshold to prevent mismatches.
    const matches = fuzzySet.get(targetKey, null, 0.7);
    if (matches) {
        // Since we already checked for 100% matches, `matches` will
        // always be an array of results of the form [[<%match>, <value matched>]]
        const matchedKey = matches[0][1];
        return keyMap[matchedKey];
    }

    return null;
}

/**
 * Given a `schema`, use fuzzy matching to match column names to
 * schema values.
 *
 * @class SpreadsheetRowMapper
 */
export class SpreadsheetRowMapper {
    constructor(schema) {
        this.keys = schema.keys;
        this.keyMap = { ...schema.keyMap };
        // `keys` are always valid, so make sure they are in the keymap.
        for (const key of this.keys) {
            this.keyMap[key] = key;
        }
        // Maintain a copy of `this.keyMap`. Items are deleted
        // from this copy when they are matched (and cached). That
        // way we don't accidentally double-match an item.
        this.unmatchedKeys = { ...this.keyMap };

        // This stores associations that we've found in
        // the spreadsheet already.
        this.empiricalKeyMap = {};
        this.unknownKeys = {};
    }
    /**
     * Inputs an object, e.g. `{"First Name": "Joe", "Last Name": "Smith"}`
     * and returns a formatted object where the keys have been replaced by
     * keys from the schema. E.g., this function might return `{first_name: "Joe", last_name: "Smith"}`.
     *
     * The search for appropriate keys is done with a fuzzy matching algorithm, so
     * the processed spreadsheet headers don't need to exactly match what's given.
     *
     * @param {*} row
     * @param {boolean} log - whether or not to show lookups using `console.log`
     * @memberof SpreadsheetRowMapper
     */
    formatRow(row, log = true) {
        const ret = {};
        for (const [key, value] of Object.entries(row)) {
            // If we've found this key before, use the cached version.
            if (key in this.empiricalKeyMap) {
                ret[this.empiricalKeyMap[key]] = value;
                continue;
            }
            // If we have cached that we don't know a key, continue
            if (key in this.unknownKeys) {
                continue;
            }
            const matchedKey = findMatchingKey(key, this.unmatchedKeys);
            if (matchedKey == null) {
                if (log) {
                    console.log(
                        "Could not find a key corresponding to spreadsheet column",
                        `"${key}"`
                    );
                }
                this.unknownKeys[key] = true;
                continue;
            }
            if (log) {
                console.log(
                    "Assuming association between spreadsheet column",
                    `"${key}"`,
                    "and the key",
                    `"${matchedKey}"`
                );
            }
            this.empiricalKeyMap[key] = matchedKey;
            deleteReferences(matchedKey, this.unmatchedKeys);
            ret[matchedKey] = value;
        }

        return ret;
    }
}

/**
 * Find a suitable match in the `people` array for `name`. `name` can
 * be a utorid or a string `"Last, First"` or a string `"First Last"`.
 * If no suitable match is found, an error is thrown.
 *
 * @export
 * @param {string} name
 * @param {{utorid: string, first_name: string, last_name: string}[]} people
 * @returns
 */
export function matchByUtoridOrName(name, people) {
    let match = people.find((x) => x.utorid === name);
    if (match) {
        // We found an exact match by UTORid
        return match;
    }

    const nameHash = {};
    for (const person of people) {
        // We want to be able to match no matter the order in which the names are specified.
        nameHash[`${person.last_name}, ${person.first_name}`] = person;
        nameHash[`${person.first_name} ${person.last_name}`] = person;
    }

    const fuzzySet = FuzzySet(Object.keys(nameHash));
    match = fuzzySet.get(name, null, 0.7);
    if (match) {
        let matchedKey = match;
        if (Array.isArray(match)) {
            // If we get an array as a result, it will be of the form [[<%match>, <value matched>]]
            matchedKey = match[0][1];
        }
        return nameHash[matchedKey];
    }

    throw new Error(`Could not find a match for "${name}"`);
}

/**
 * Parse a date string or integer and return a normalized date string.
 *
 * @param {string | number} str - input date; either a string or an excel date integer
 * @returns {string} - date in YYYY-MM-DD:T00:00:00.000 format
 */
function parseDate(str) {
    // Dates parsed from excel will come in as a number. Convert those to an appropriate string first.
    if (typeof str === "number") {
        // Convert to seconds since epoc
        const sec = Math.round((str - 25569) * 86400 * 1000);
        // Excel ignores timezone information, so we need to parse this and
        // remove the timezone tag.
        str = new Date(sec).toJSON().replace("Z", "");
    }
    // Parse the date accepting many different formats
    let date = chrono.parseDate(str);
    // We need to jump through some hoops to remove all the timezone information.
    try {
        return date.toJSON().replace(/T.*/, "T00:00:00.000Z");
    } catch (e) {
        throw new Error(`Cannot parse "${str}" as date`);
    }
}

/**
 * Use `schema` to normalize `data` to be an array of objects specified
 * by `schema`. `data` is expected to be an object with `fileType`
 * and `data` attributes. `data.fileType` may be `"json"` or `"spreadsheet"`.
 * `"json"` data is expected to already match the schema. `"spreadsheet"` data
 * is converted to match the schema using fuzzy matching on column names (if needed).
 *
 * @export
 * @param {{fileType: "json" | "spreadsheet", data: any}} data
 * @param {*} [schema={ keys: [], requiredKeys: [] }]
 * @returns
 */
export function normalizeImport(
    data,
    schema = { keys: [], requiredKeys: [], dateColumns: [] }
) {
    const { keys, baseName } = schema;
    let ret = [];
    if (data.fileType === "json") {
        // Unwrap data so that it's just an array
        data = data.data;
        if (data[baseName]) {
            data = data[baseName];
        }
        for (const item of data) {
            const newItem = {};
            for (const key of keys) {
                newItem[key] = item[key];
            }
            ret.push(newItem);
        }
    }

    if (data.fileType === "spreadsheet") {
        // `data` should be an array of objects indexed by column name.
        // E.g., [{"First Name": "Joe", "Last Name": "Smith"}, ...]
        data = data.data;

        const rowMapper = new SpreadsheetRowMapper(schema);

        for (const row of data) {
            ret.push(rowMapper.formatRow(row));
        }
    }

    if (schema.dateColumns && schema.dateColumns.length > 0) {
        ret = ret.map((row) => {
            const newRow = { ...row };
            for (const col of schema.dateColumns) {
                newRow[col] = parseDate(newRow[col]);
            }
            return newRow;
        });
    }

    validate(ret, schema);

    return ret;
}

/**
 * Recursive determine whether `obj1` and `obj2` are the same. If `obj1`/`obj2` have
 * an `id` property, they are assumed equal if their ids match.
 *
 * @param {*} obj1
 * @param {*} obj2
 * @returns
 */
function recursiveIsSame(obj1, obj2) {
    // Short-circuit if they are literally equal.
    if (obj1 === obj2 || (obj1 == null && obj2 == null)) {
        return true;
    }
    // strings, numbers, undefined, and null are all literally equal,
    // so these types shouldn't exist in the code at this point.
    if (
        obj1 == null ||
        obj2 == null ||
        typeof obj1 === "string" ||
        typeof obj1 === "number"
    ) {
        return false;
    }
    // so we just have arrays and objects remaining (ignoring strange things like NaN)
    if (Array.isArray(obj1)) {
        return (
            obj1.length === obj2.length &&
            obj1.every((a, i) => recursiveIsSame(a, obj2[i]))
        );
    }
    // For objects, if they have the same ID, we will assume they are equal, otherwise
    // do a deep comparison.
    if ("id" in obj1) {
        return obj1.id === obj2.id;
    }
    return (
        recursiveIsSame(Object.keys(obj1), Object.keys(obj2)) &&
        Object.keys(obj1).every((prop) =>
            recursiveIsSame(obj1[prop], obj2[prop])
        )
    );
}

/**
 * Compute the difference between `currData` and `newData`. Both are expected
 * to be arrays. The difference is computed based on keys specified in `schema.keys`.
 * Values are categorized as `new`, `modified`, or `duplicate`. Whether or not a data
 * is classified as `modified` is determined by the following algorithm:
 *     1) Find if there is an entry in `currData` that shares the same `schema.primaryKey`.
 *     2) Compare all properties specified by `schema.keys` to see if there's a difference.
 *
 * @export
 * @param {*} currData
 * @param {*} newData
 * @param {*} [schema={ keys: [], primaryKey: null }]
 * @returns {{new: object[], modified: {old: object, new:object}[], duplicate: object[]}}
 */
export function diff(
    currData,
    newData,
    schema = { keys: [], primaryKey: null }
) {
    const { keys, primaryKey } = schema;
    const ret = {
        new: [],
        modified: [],
        duplicate: [],
    };

    // Index all the data by the primary key
    const lookupHash = {};
    for (const item of currData) {
        lookupHash[item[primaryKey]] = item;
    }

    for (const newItem of newData) {
        const oldItem = lookupHash[newItem[primaryKey]];
        // If an item exists with matching primary key, check to see if any of the fields
        // have changed
        if (oldItem) {
            if (
                keys.every((key) => recursiveIsSame(oldItem[key], newItem[key]))
            ) {
                ret.duplicate.push(newItem);
            } else {
                ret.modified.push({
                    old: oldItem,
                    // Copy over the id from the old item so that an appropriate upsert
                    // operation can be done on the backend
                    new: { ...newItem, id: oldItem.id },
                });
            }
        } else {
            ret.new.push(newItem);
        }
    }

    return ret;
}

/**
 *  Create a `File` object containing of the specified format.
 *
 * @param {{toSpreadsheet: func, toJson: func}} formatters - Formatters return an array of objects (usable as spreadsheet rows) or a javascript object to be passed to JSON.stringify
 * @param {"xlsx" | "csv" | "json"} dataFormat
 * @param {string} filePrefix
 * @returns {File}
 */
export function dataToFile(formatters, dataFormat, filePrefix = "") {
    const fileName = `${filePrefix}${
        filePrefix ? "_" : ""
    }export_${new Date().toLocaleDateString("en-CA", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    })}`;

    if (dataFormat === "spreadsheet" || dataFormat === "csv") {
        const workbook = XLSX.utils.book_new();
        const sheet = XLSX.utils.aoa_to_sheet(formatters.toSpreadsheet());
        XLSX.utils.book_append_sheet(workbook, sheet, "Instructors");

        const bookType = dataFormat === "csv" ? "csv" : "xlsx";

        // We convert the data into a blob and return it so that it can be downloaded
        // by the user's browser
        const file = new File(
            [XLSX.write(workbook, { type: "array", bookType })],
            `${fileName}.${bookType}`,
            {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }
        );
        return file;
    }

    if (dataFormat === "json") {
        const file = new File(
            [JSON.stringify(formatters.toJson(), null, 4)],
            `${fileName}.json`,
            {
                type: "application/json",
            }
        );
        return file;
    }

    throw new Error(
        `Cannot process data to format "${dataFormat}"; try "spreadsheet" or "json".`
    );
}
