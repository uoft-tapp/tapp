import React from "react";
import FileSaver from "file-saver";
import { exportApplications } from "../../../api/actions";
import { ExportActionButton } from "../../../components/export-button";
import {
    ExportFormat,
    prepareApplicationData,
} from "../../../libs/import-export";
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
    const [exportType, setExportType] = React.useState<ExportFormat | null>(
        null
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

            const file = await dispatch(
                exportApplications(prepareApplicationData, exportType)
            );

            FileSaver.saveAs(file as any);
        }
        doExport().catch(console.error);
    }, [exportType, dispatch]);

    function onClick(option: ExportFormat) {
        setExportType(option);
    }

    return <ExportActionButton onClick={onClick} />;
}

// export function ConnectedImportApplicationsAction() {
//     const dispatch = useThunkDispatch();
//     const applicants = useSelector(applicantsSelector);
//     const [fileContent, setFileContent] = React.useState<DataFormat | null>(
//         null
//     );
//     const [diffed, setDiffed] = React.useState<
//         DiffSpec<MinimalApplicant, Applicant>[] | null
//     >(null);
//     const [processingError, setProcessingError] = React.useState(null);
//     const [inProgress, setInProgress] = React.useState(false);

//     // Make sure we aren't showing any diff if there's no file loaded.
//     React.useEffect(() => {
//         if (!fileContent) {
//             if (diffed) {
//                 setDiffed(null);
//             }
//         }
//     }, [diffed, setDiffed, fileContent]);

//     // Recompute the diff every time the file changes
//     React.useEffect(() => {
//         // If we have no file or we are currently in the middle of processing another file,
//         // do nothing.
//         if (!fileContent || inProgress) {
//             return;
//         }
//         try {
//             setProcessingError(null);
//             // normalize the data coming from the file
//             const data = normalizeImport(
//                 fileContent,
//                 applicantSchema
//             ) as MinimalApplicant[];
//             // Compute which applicants have been added/modified
//             const newDiff = diffImport.applicants(data, { applicants });

//             setDiffed(newDiff);
//         } catch (e: any) {
//             console.warn(e);
//             setProcessingError(e);
//         }
//     }, [fileContent, applicants, inProgress]);

//     async function onConfirm() {
//         if (!diffed) {
//             throw new Error("Unable to compute an appropriate diff");
//         }
//         const changedApplicants = getChanged(diffed);

//         await dispatch(upsertApplicants(changedApplicants));

//         setFileContent(null);
//     }

//     let dialogContent = <p>No data loaded...</p>;
//     if (processingError) {
//         dialogContent = <Alert variant="danger">{"" + processingError}</Alert>;
//     } else if (diffed) {
//         const newItems = diffed
//             .filter((item) => item.status === "new")
//             .map((item) => item.obj);
//         const modifiedDiffSpec = diffed.filter(
//             (item) => item.status === "modified"
//         );

//         if (newItems.length === 0 && modifiedDiffSpec.length === 0) {
//             dialogContent = (
//                 <Alert variant="warning">
//                     No difference between imported applicants and those already
//                     on the system.
//                 </Alert>
//             );
//         } else {
//             dialogContent = (
//                 <>
//                     {newItems.length > 0 && (
//                         <Alert variant="primary">
//                             <span className="mb-1">
//                                 The following <strong>{newItems.length}</strong>{" "}
//                                 applicant{newItems.length > 1 ? "s" : ""} will
//                                 be <strong>added</strong>
//                             </span>
//                             <ApplicantsList applicants={newItems} />
//                         </Alert>
//                     )}
//                     {modifiedDiffSpec.length > 0 && (
//                         <Alert variant="info">
//                             <span className="mb-1">
//                                 The following applicants will be{" "}
//                                 <strong>modified</strong>
//                             </span>
//                             <ApplicantsDiffList
//                                 modifiedApplicants={modifiedDiffSpec}
//                             />
//                         </Alert>
//                     )}
//                 </>
//             );
//         }
//     }

//     return (
//         <ImportActionButton
//             onConfirm={onConfirm}
//             onFileChange={setFileContent}
//             dialogContent={dialogContent}
//             setInProgress={setInProgress}
//         />
//     );
// }