import * as XLSX from "xlsx";

export type ExportFormat = "csv" | "json" | "spreadsheet";
export type ExportFormatters = {
    toJson: () => any;
    toSpreadsheet: () => (string | number | null | undefined)[][];
};

/**
 *  Create a `File` object containing of the specified format.
 *
 * @param formatters - Formatters return an array of objects (usable as spreadsheet rows) or a javascript object to be passed to JSON.stringify
 * @param dataFormat
 * @param filePrefix
 * @returns
 */
export function dataToFile(
    formatters: ExportFormatters,
    dataFormat: ExportFormat,
    filePrefix = ""
) {
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
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
