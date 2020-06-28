/*
 * A collection of utility functions for dealing with imported data (e.g., spreadsheets
 * and JSON files).
 */
import FuzzySet from "fuzzyset";
import XLSX from "xlsx";

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
     * @memberof SpreadsheetRowMapper
     */
    formatRow(row) {
        console.log("calling", this.empiricalKeyMap);
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
                console.log(
                    "Could not find a key corresponding to spreadsheet column",
                    `"${key}"`
                );
                this.unknownKeys[key] = true;
                continue;
            }
            console.log(
                "Assuming association between spreadsheet column",
                `"${key}"`,
                "and the key",
                `"${matchedKey}"`
            );
            this.empiricalKeyMap[key] = matchedKey;
            deleteReferences(matchedKey, this.unmatchedKeys);
            ret[matchedKey] = value;
        }

        return ret;
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
export function normalizeImport(data, schema = { keys: [], requiredKeys: [] }) {
    const { keys } = schema;
    const ret = [];
    if (data.fileType === "json") {
        // Unwrap data so that it's just an array
        data = data.data;
        if (data.instructors) {
            data = data.instructors;
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

    validate(ret, schema);

    return ret;
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
            if (keys.every((key) => oldItem[key] === newItem[key])) {
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
