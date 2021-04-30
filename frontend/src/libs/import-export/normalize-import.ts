import * as chrono from "chrono-node";
import { NormalizationSchema } from "../schema";
import { SpreadsheetRowMapper } from "./spreadsheet-row-mapper";
import { validate } from "./validate";

/**
 * Parse a date string or integer and return a normalized date string.
 *
 * @param str - input date; either a string or an excel date integer
 * @returns date in YYYY-MM-DD:T00:00:00.000 format
 */
function parseDate(str: string | number) {
    // Dates parsed from excel will come in as a number. Convert those to an appropriate string first.
    if (typeof str === "number") {
        // Convert to seconds since epoch
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

export type DataFormat =
    | { fileType: "json"; data: any }
    | { fileType: "spreadsheet"; data: any[][] };

/**
 * Use `schema` to normalize `data` to be an array of objects specified
 * by `schema`. `data` is expected to be an object with `fileType`
 * and `data` attributes. `data.fileType` may be `"json"` or `"spreadsheet"`.
 * `"json"` data is expected to already match the schema. `"spreadsheet"` data
 * is converted to match the schema using fuzzy matching on column names (if needed).
 *
 * @export
 * @returns
 */
export function normalizeImport(
    dataWrapper: DataFormat,
    schema: NormalizationSchema<string[]> = {
        keys: [],
        requiredKeys: [],
        dateColumns: [],
        keyMap: {},
        primaryKey: "",
        baseName: "",
    },
    log = true
) {
    const { keys, baseName } = schema;
    let ret = [];
    if (dataWrapper.fileType === "json") {
        // Unwrap data so that it's just an array
        let data = dataWrapper.data;
        if (data[baseName]) {
            data = data[baseName];
        }
        for (const item of data) {
            const newItem: Record<string, any> = {};
            for (const key of keys) {
                newItem[key] = item[key];
            }
            ret.push(newItem);
        }
    }

    if (dataWrapper.fileType === "spreadsheet") {
        // `data` should be an array of objects indexed by column name.
        // E.g., [{"First Name": "Joe", "Last Name": "Smith"}, ...]
        let data = dataWrapper.data;

        const rowMapper = new SpreadsheetRowMapper(schema);

        for (const row of data) {
            ret.push(rowMapper.formatRow(row, log));
        }
    }

    if (schema.dateColumns && schema.dateColumns.length > 0) {
        ret = ret.map((row) => {
            const newRow = { ...row };
            for (const col of schema.dateColumns) {
                if (newRow[col] != null) {
                    newRow[col] = parseDate(newRow[col]);
                }
            }
            return newRow;
        });
    }

    validate(ret, schema);

    return ret;
}
