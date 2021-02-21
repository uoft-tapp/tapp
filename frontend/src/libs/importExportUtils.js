/*
 * A collection of utility functions for dealing with imported data (e.g., spreadsheets
 * and JSON files).
 */
import FuzzySet from "fuzzyset";
import XLSX from "xlsx";
import * as chrono from "chrono-node";
import { prepareMinimal } from "./exportUtils";

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
function findMatchingKey(targetKey, keyMap = {}) {
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

/**
 * Return an array of [hours, duty, hours duty, ...] for the specified `ddah`
 *
 * @export
 * @param {Ddah} ddah
 * @returns {((string | number)[])}
 */
export function flattenDuties(ddah) {
    const ret = [];
    const duties = [...ddah.duties];
    duties.sort((a, b) => a.order - b.order);

    for (const duty of duties) {
        ret.push(duty.hours);
        ret.push(duty.description);
    }

    return ret;
}

/**
 * Format a date as YYYY-MM-DD for inserting into a spreadsheet
 *
 * @export
 * @param {*} date
 * @returns
 */
export function formatDateForSpreadsheet(date) {
    try {
        return date && new Date(date).toJSON().slice(0, 10);
    } catch (e) {
        return "";
    }
}

/**
 * Create header columns for a spreadsheet containing information about every pay period.
 *
 * @export
 * @param {*} assignments
 * @returns
 */
export function createPayPeriodHeaders(assignments) {
    const ret = [];
    if (!assignments) {
        return ret;
    }
    const maxNumPeriods = Math.max(
        ...assignments.map((assignment) => assignment.wage_chunks?.length || 0),
        0
    );

    for (let i = 0; i < maxNumPeriods; i++) {
        ret.push(
            `Period ${i + 1} Rate`,
            `Period ${i + 1} Hours`,
            `Period ${i + 1} Start Date`,
            `Period ${i + 1} End Date`
        );
    }
    return ret;
}

/**
 * Create formatted rows providing information about each wage chunk.
 *
 * @export
 * @param {*} wageChunks
 * @returns
 */
export function formatWageChunksToList(wageChunks) {
    const ret = [];
    if (!wageChunks) {
        return ret;
    }

    ret.push(wageChunks.length);
    for (const chunk of wageChunks) {
        ret.push(
            chunk.rate,
            chunk.hours,
            formatDateForSpreadsheet(chunk.start_date),
            formatDateForSpreadsheet(chunk.end_date)
        );
    }
    return ret;
}

/**
 * Functions which turns an array of objects into an Array of Arrays suitable
 * for converting into a spreadsheet.
 */
export const prepareSpreadsheet = {
    instructor: function (instructors) {
        return [["Last Name", "First Name", "UTORid", "email"]].concat(
            instructors.map((instructor) => [
                instructor.last_name,
                instructor.first_name,
                instructor.utorid,
                instructor.email,
            ])
        );
    },
    applicant: function (applicants) {
        return [
            [
                "Last Name",
                "First Name",
                "UTORid",
                "Student Number",
                "email",
                "Phone",
            ],
        ].concat(
            applicants.map((applicant) => [
                applicant.last_name,
                applicant.first_name,
                applicant.utorid,
                applicant.student_number,
                applicant.email,
                applicant.phone,
            ])
        );
    },
    position: function (positions) {
        return [
            [
                "Position Code",
                "Position Title",
                "Start Date",
                "End Date",
                "Hours Per Assignment",
                "Number of Assignments",
                "Contract Template",
                "Instructors",
                "Duties",
                "Qualifications",
                "Current Enrollment",
                "Current Waitlist",
            ],
        ].concat(
            positions.map((position) => [
                position.position_code,
                position.position_title,
                position.start_date &&
                    new Date(position.start_date).toJSON().slice(0, 10),
                position.end_date &&
                    new Date(position.end_date).toJSON().slice(0, 10),
                position.hours_per_assignment,
                position.desired_num_assignments,
                position.contract_template.template_name,
                position.instructors
                    .map(
                        (instructor) =>
                            `${instructor.last_name}, ${instructor.first_name}`
                    )
                    .join("; "),
                position.duties || "",
                position.qualifications || "",
                position.current_enrollment,
                position.current_waitlisted,
            ])
        );
    },
    ddah: function prepareDdahsSpreadsheet(ddahs) {
        // Compute the maximum number of duties, because each duty gets a column.
        const maxDuties = Math.max(
            ...ddahs.map((ddah) => ddah.duties.length || 0),
            0
        );
        // Create headers for the duty columns
        const dutyHeaders = Array.from({ length: maxDuties * 2 }, (_, i) => {
            if (i % 2 === 0) {
                return `Hours ${i / 2 + 1}`;
            }
            return `Duty ${(i - 1) / 2 + 1}`;
        });

        return [
            [
                "Position",
                "Last Name",
                "First Name",
                "email",
                "Assignment Hours",
                "Offer Status",
                "",
            ].concat(dutyHeaders),
        ].concat(
            ddahs.map((ddah) =>
                [
                    ddah.assignment.position.position_code,
                    ddah.assignment.applicant.last_name,
                    ddah.assignment.applicant.first_name,
                    ddah.assignment.applicant.email,
                    ddah.assignment.hours,
                    ddah.assignment.active_offer_status,
                    "",
                ].concat(flattenDuties(ddah))
            )
        );
    },
    assignment: function (assignments) {
        // We want to flatten a lot of the data in `assignments` and only include the information
        // we need.
        const assignmentsForSpreadsheet = assignments.map((assignment) => ({
            first_name: assignment.applicant.first_name,
            last_name: assignment.applicant.last_name,
            utorid: assignment.applicant.utorid,
            email: assignment.applicant.email,
            position_code: assignment.position.position_code,
            start_date: assignment.start_date,
            end_date: assignment.end_date,
            contract_template: assignment.contract_override_pdf
                ? null
                : assignment.position.contract_template.template_name,
            contract_override_pdf: assignment.contract_override_pdf,
            hours: assignment.hours,
            active_offer_status: assignment.active_offer_status,
            active_offer_recent_activity_date:
                assignment.active_offer_recent_activity_date,
            wage_chunks: assignment.wage_chunks.map((chunk) => ({
                hours: chunk.hours,
                rate: chunk.rate,
                start_date: chunk.start_date,
                end_date: chunk.end_date,
            })),
        }));
        return [
            [
                "Last Name",
                "First Name",
                "UTORid",
                "Email",
                "Position Code",
                "Start Date",
                "End Date",
                "Hours",
                "Contract Template",
                "Contract Override PDF",
                "Offer Status",
                "Recent Activity Date",
                "",
                "Number of Pay Periods",
                ...createPayPeriodHeaders(assignmentsForSpreadsheet),
            ],
        ].concat(
            assignmentsForSpreadsheet.map((assignment) => [
                assignment.last_name,
                assignment.first_name,
                assignment.utorid,
                assignment.email,
                assignment.position_code,
                formatDateForSpreadsheet(assignment.start_date),
                formatDateForSpreadsheet(assignment.end_date),
                assignment.hours,
                assignment.contract_template,
                assignment.contract_override_pdf,
                assignment.active_offer_status,
                undefined,
                assignment.active_offer_recent_activity_date,
                ...formatWageChunksToList(assignment.wage_chunks),
            ])
        );
    },
};

/**
 * A factory function which produces corresponding prepareData function,
 *  for each type of object (possibly needs filtering or associated session).
 *
 * @param {string} objectType
 * @param {Function | null} objectFilter
 * @param {Session | null} session
 * @returns {Function}
 */
export function prepareDataFactory(
    objectType,
    objectFilter = null,
    session = null
) {
    // Make a function that converts a list of instructors into a `File` object.
    return function prepareData(objects, dataFormat) {
        if (objectFilter) {
            objects = objectFilter(objects);
        }
        return dataToFile(
            {
                toSpreadsheet: () => prepareSpreadsheet[objectType],
                toJson: () => ({
                    [objectType + "s"]: objects.map((object) =>
                        prepareMinimal[objectType](
                            session ? (object, session) : object
                        )
                    ),
                }),
            },
            dataFormat,
            objectType + "s"
        );
    };
}
