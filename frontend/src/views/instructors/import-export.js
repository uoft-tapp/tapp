import React from "react";
import XLSX from "xlsx";
import FileSaver from "file-saver";
import { instructorsSelector, exportInstructors } from "../../api/actions";
import { useSelector, useDispatch } from "react-redux";
import { ExportButton } from "../../components/export-button";

/**
 * Process a list of instructors and return a `File` object containing the data.
 *
 * @param {*} instructors
 * @param {*} dataFormat
 * @returns {File}
 */
function prepareData(instructors, dataFormat) {
    const fileName = `instructors_export_${new Date().toLocaleDateString(
        "en-CA",
        { year: "numeric", month: "numeric", day: "numeric" }
    )}`;

    console.log("moo", dataFormat);
    if (dataFormat === "spreadsheet" || dataFormat === "csv") {
        const workbook = XLSX.utils.book_new();
        const sheet = XLSX.utils.aoa_to_sheet(
            [["Last Name", "First Name", "UTORid", "email"]].concat(
                instructors.map((instructor) => [
                    instructor.last_name,
                    instructor.first_name,
                    instructor.utorid,
                    instructor.email,
                ])
            )
        );
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
            [JSON.stringify({ instructors }, null, 4)],
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
 * Allows for the download of a file blob containing the exported instructors.
 * Instructors are synchronized from the server before being downloaded.
 *
 * @export
 * @returns
 */
export function ConnectedExportInstructorsButton() {
    const dispatch = useDispatch();
    const instructors = useSelector(instructorsSelector);
    const [exportType, setExportType] = React.useState(null);

    React.useEffect(() => {
        if (!exportType) {
            return;
        }

        async function doExport() {
            // Having an export type of `null` means we're ready to export again,
            // We set the export type to null at the start so in case an error occurs,
            // we can still try again. This *will not* affect the current value of `exportType`
            setExportType(null);

            const file = await dispatch(
                exportInstructors(prepareData, exportType)
            );

            FileSaver.saveAs(file);
        }
        doExport().catch(console.error);
    }, [exportType, dispatch]);

    function onClick(option) {
        console.log(option, instructors);
        setExportType(option);
    }

    return <ExportButton onClick={onClick} />;
}
