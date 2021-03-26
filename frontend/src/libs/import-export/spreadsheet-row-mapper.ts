import FuzzySet from "fuzzyset";
import { NormalizationSchema } from "../schema";

/**
 * Delete all properties from `keyMap` that have `value` as
 * their value. This function mutates `keyMap`.
 *
 * @param {*} value
 * @param {*} keyMap
 * @returns
 */
function deleteReferences(value: any, keyMap: Record<any, any>) {
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
 * @param targetKey
 * @param [keyMap={}]
 * @returns
 */
function findMatchingKey(
    targetKey: string,
    keyMap: Record<string, string | number> = {}
) {
    if (targetKey in keyMap) {
        return keyMap[targetKey];
    }
    const fuzzySet = FuzzySet(Object.keys(keyMap));
    // We set a 70% match threshold to prevent mismatches.
    const matches = (fuzzySet.get as any)(targetKey, null, 0.7);
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
export class SpreadsheetRowMapper<
    T extends Pick<NormalizationSchema<string[]>, "keys" | "keyMap">
> {
    keys: T["keys"];
    keyMap: Record<string, string | number>;
    unmatchedKeys: Record<string, string | number>;
    empiricalKeyMap: Record<string, string | number>;
    unknownKeys: Record<string, boolean>;

    constructor(schema: T) {
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
     * @param row
     * @param log - whether or not to show lookups using `console.log`
     * @memberof SpreadsheetRowMapper
     */
    formatRow(row: Record<string, any>, log = true) {
        const ret: Record<string, any> = {};
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
