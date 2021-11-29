import React from "react";
import FileSaver from "file-saver";
import { applicationsSelector } from "../../../api/actions";
import { ExportActionButton } from "../../../components/export-button";
import {
    ExportFormat,
    prepareApplicationData,
} from "../../../libs/import-export";
import { useSelector } from "react-redux";
import { activePositionSelector } from "../store/actions";

/**
 * Allows for the download of a file blob containing the exported instructors.
 * Instructors are synchronized from the server before being downloaded.
 *
 * @export
 * @returns
 */
export function ConnectedExportApplicationsAction() {
    const [exportType, setExportType] = React.useState<ExportFormat | null>(
        null
    );
    const activePosition = useSelector(activePositionSelector);
    const allApplications = useSelector(applicationsSelector);
    const applications = React.useMemo(
        () =>
            activePosition
                ? allApplications.filter((app) =>
                      app.position_preferences.some(
                          (pref) => pref.position.id === activePosition.id
                      )
                  )
                : [],
        [activePosition, allApplications]
    );

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

            const file = prepareApplicationData(applications, exportType);
            FileSaver.saveAs(file as any);
        }
        doExport().catch(console.error);
    }, [exportType, applications]);

    function onClick(option: ExportFormat) {
        setExportType(option);
    }

    return <ExportActionButton onClick={onClick} />;
}
