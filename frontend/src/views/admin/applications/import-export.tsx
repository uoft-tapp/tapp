import React from "react";
import FileSaver from "file-saver";
import { exportApplications } from "../../../api/actions";
import { ExportActionButton } from "../../../components/export-button";
import { prepareApplicationData } from "../../../libs/import-export";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

/**
 * Allows for the download of a file blob containing the exported instructors.
 * Instructors are synchronized from the server before being downloaded.
 *
 * @export
 * @returns
 */
export function ConnectedExportApplicationsAction() {
    const dispatch = useThunkDispatch();
    const [exportType, setExportType] = React.useState<
        "spreadsheet" | "json" | null
    >(null);

    React.useEffect(() => {
        if (!exportType) {
            return;
        }

        async function doExport() {
            // Having an export type of `null` means we're ready to export again,
            // We set the export type to null at the start so in case an error occurs,
            // we can still try again. This *will not* affect the current value of `exportType`
            setExportType(null);
            if (exportType == null) {
                throw new Error(`Unknown export type ${exportType}`);
            }

            const file = await dispatch(
                exportApplications(prepareApplicationData, exportType)
            );

            FileSaver.saveAs(file as any);
        }
        doExport().catch(console.error);
    }, [exportType, dispatch]);

    function onClick(option: "spreadsheet" | "json") {
        setExportType(option);
    }

    return <ExportActionButton onClick={onClick} />;
}
