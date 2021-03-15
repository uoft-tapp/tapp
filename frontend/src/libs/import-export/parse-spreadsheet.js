/* eslint-env node */
import XLSX from "xlsx";

export function parseSpreadsheet(fileName) {
    const workbook = XLSX.readFile(
        __dirname + `../../tests/import-export-data/${fileName}`
    );
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let dataCSV = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    // transform to array of objects
    const keys = dataCSV.shift();
    dataCSV = dataCSV.map(function (row) {
        return keys.reduce(function (obj, key, i) {
            obj[key] = row[i];
            return obj;
        }, {});
    });
    return dataCSV;
}
