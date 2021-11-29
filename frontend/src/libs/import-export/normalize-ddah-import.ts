import { Applicant, MinimalDdah } from "../../api/defs/types";
import {
    SpreadsheetRowMapper,
    matchByUtoridOrName,
} from "../../libs/import-export";

/**
 * Convert imported spreadsheet or JSON data into an
 * array of minimal DDAH objects.
 *
 * @param {({
 *     fileType: "json" | "spreadsheet";
 *     data: any;
 * })} data
 * @param {Applicant[]} applicants
 * @returns {MinimalDdah[]}
 */
export function normalizeDdahImports(
    data: {
        fileType: "json" | "spreadsheet";
        data: any;
    },
    applicants: Applicant[],
    log = true,
    positionCodeOverride?: string
): MinimalDdah[] {
    let ret: MinimalDdah[] = [];

    if (data.fileType === "json") {
        let unwrapped: MinimalDdah[] = data.data;
        if ((unwrapped as any).ddahs) {
            unwrapped = (unwrapped as any).ddahs;
        }
        for (const ddah of unwrapped) {
            ret.push(ddah);
        }
    }

    if (data.fileType === "spreadsheet") {
        const unwrapped = data.data;
        // Get an upper bound for the maximum number of duties that the spreadsheet might have
        let maxDuties = Math.round(
            Math.max(
                ...unwrapped.map((row: object) => Object.keys(row).length),
                0
            ) / 2
        );
        // If cells are blank, SheetJS does not import them. Therefore,
        // the max number of cells found will be an under-count. This
        // caused issue https://github.com/uoft-tapp/tapp/issues/575
        // As an ugly hack, we just assume there's no more than 50 additional duties.
        maxDuties += 50;

        // We need to generate a keymap for all the likely column names
        const keyMap: { [key: string]: string } = {
            Position: "position_code",
            "First Name": "first_name",
            "Given Name": "first_name",
            First: "first_name",
            "Last Name": "last_name",
            Surname: "last_name",
            "Family Name": "last_name",
            Last: "last_name",
        };
        // We will also add `Hours #` and `Duty #` to the keymap for the number of duties in our range
        for (let i = 0; i <= maxDuties; i++) {
            keyMap[`Duty ${i}`] = `duty_${i}`;
            keyMap[`Hours ${i}`] = `hours_${i}`;
            if (i < 10) {
                keyMap[`Duty 0${i}`] = `duty_${i}`;
                keyMap[`Hours 0${i}`] = `hours_${i}`;
            }
        }

        // SpreadsheetRowMapper will perform fuzzy matching of column names for us.
        const rowMapper = new SpreadsheetRowMapper({
            keys: ["position_code", "first_name", "last_name", "utorid"],
            keyMap,
        });

        for (const row of unwrapped) {
            const normalized: {
                [key: string]: any;
            } = rowMapper.formatRow(row, log);
            if (positionCodeOverride) {
                normalized.position_code = positionCodeOverride;
            }
            if (normalized.utorid == null) {
                // If a UTORid column was not specified, we need to manually search the applicants for
                // someone matching the first/last name. `matchByUtoridOrName` will succeed or throw an error,
                // so if we make it past this line of code, we've successfully found a match.
                const applicant = matchByUtoridOrName(
                    `${normalized.first_name} ${normalized.last_name}`,
                    applicants
                ) as Applicant;
                normalized.utorid = applicant.utorid;
                delete normalized.first_name;
                delete normalized.last_name;
            }
            // Now we need to condense duties to a list
            // The easiest way is to just hunt for them
            const duties: { description: string; hours: number }[] = [];
            for (let i = 0; i <= maxDuties; i++) {
                const duty = normalized[`duty_${i}`];
                const hours = normalized[`hours_${i}`];
                if (duty != null || hours != null) {
                    duties.push({ description: duty || "", hours: hours || 0 });
                    delete normalized[`duty_${i}`];
                    delete normalized[`hours_${i}`];
                }
            }
            ret.push({
                position_code: normalized.position_code,
                applicant: normalized.utorid,
                duties,
            });
        }
    }

    return ret;
}
