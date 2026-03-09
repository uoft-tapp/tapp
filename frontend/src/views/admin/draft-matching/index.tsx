import { DragAndDropInterface } from "./drag-and-drop-interface";

import "./draft-matching.css";
import { Alert, Button } from "react-bootstrap";
import { BsDownload, BsUpload } from "react-icons/bs";
import React from "react";
import { FinalizeDraftAssignmentsButton } from "./FinalizeDraftAssignmentsButton";
import { useSelector } from "react-redux";
import {
    DraftMatchingState,
    MinimalAssignmentDraft,
    selfSelector,
} from "./state/slice";
import FileSaver from "file-saver";
import {
    activeSessionSelector,
    applicantsSelector,
    positionsSelector,
} from "../../../api/actions";
import { ImportButton } from "../../../components/import-button";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { AdditionalDataButton } from "./set-additional-data-dialog";
import { importExtraDataThunk, makeExportableData } from "./state/thunks";
import { AboutDialogButton } from "./about-dialog";

/**
 * Matching view for drafting assignments. This is mainly used by the Math department.
 */
export function AdminDraftMatchingView() {
    return (
        <div className="page-body matching">
            <div className="matching-body">
                <DragAndDropInterface />
            </div>
            <div className="matching-footer page-actions">
                <DownloadDraftAssignmentsButton />
                <ImportDraftAssignmentsButton />
                <AdditionalDataButton />
                <AboutDialogButton />
                <div className="footer-button-separator" />
                <FinalizeDraftAssignmentsButton />
            </div>
        </div>
    );
}

export type ExportedDraftMatchingAssignmentData = Omit<
    DraftMatchingState,
    "activePositionCodes" | "activeApplicantUtorid" | "assignments"
> & { assignments: MinimalAssignmentDraft[] };

function DownloadDraftAssignmentsButton() {
    const draftData = useSelector(selfSelector);
    const activeSession = useSelector(activeSessionSelector);
    return (
        <Button
            variant="outline-primary"
            title="Save draft data for archiving or for reusing later"
            onClick={() => {
                const fileName = `export_${new Date().toLocaleDateString(
                    "en-CA",
                    {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                    }
                )}`;

                const exportData = makeExportableData(
                    draftData,
                    activeSession!
                );

                const file = new File(
                    [JSON.stringify(exportData, null, 4)],
                    `${fileName}.json`,
                    {
                        type: "application/json",
                    }
                );
                FileSaver.saveAs(file);
            }}
        >
            <BsDownload /> Export Draft Data
        </Button>
    );
}
function ImportDraftAssignmentsButton() {
    const dispatch = useThunkDispatch();
    const applicants = useSelector(applicantsSelector);
    const allUtorids = React.useMemo(
        () => new Set(applicants.map((a) => a.utorid)),
        [applicants]
    );
    const positions = useSelector(positionsSelector);
    const allPositions = React.useMemo(
        () => new Set(positions.map((p) => p.position_code)),
        [positions]
    );
    const [fileContents, setFileContents] =
        React.useState<ExportedDraftMatchingAssignmentData | null>(null);
    const [warnings, setWarnings] = React.useState<React.ReactNode[]>([]);

    React.useEffect(() => {
        // Check to make sure all utorids and position codes in the file are valid
        if (!fileContents) {
            return;
        }
        const newWarnings: React.ReactNode[] = [];
        for (const assignment of fileContents.assignments) {
            if (!allUtorids.has(assignment.utorid)) {
                newWarnings.push(
                    <>
                        Utorid <code>{assignment.utorid}</code> doesn't
                        correspond to any applicant (are you in the correct
                        session?).
                    </>
                );
            }
            if (!allPositions.has(assignment.position_code)) {
                newWarnings.push(
                    <>
                        Position code <code>{assignment.position_code}</code>{" "}
                        does not exist in the current session.
                    </>
                );
            }
        }
        setWarnings(newWarnings);
    }, [fileContents, allUtorids, allPositions]);

    return (
        <ImportButton
            onFileChange={(content) => {
                setFileContents(content?.data);
            }}
            dialogContent={
                <div>
                    {fileContents && (
                        <Alert variant="info">
                            Import{" "}
                            <ul>
                                <li>
                                    <b>{fileContents.assignments.length}</b>{" "}
                                    assignments
                                </li>
                                <li>
                                    A show list of length{" "}
                                    <b>{fileContents.showList.length}</b>
                                </li>
                                <li>
                                    A hide list of length{" "}
                                    <b>{fileContents.hideList.length}</b>
                                </li>
                                <li>
                                    Min/max hour (e.g. subsequent appointments)
                                    targets for{" "}
                                    <b>
                                        {
                                            Object.keys(
                                                fileContents.desiredHoursByUtorid ||
                                                    {}
                                            ).length
                                        }
                                    </b>{" "}
                                    applicants.
                                </li>
                            </ul>
                        </Alert>
                    )}
                    {warnings.map((warning, index) => (
                        <Alert key={index} variant="warning">
                            {warning}
                        </Alert>
                    ))}
                </div>
            }
            onConfirm={async () => {
                // Do the actual importing.
                if (!fileContents) {
                    return;
                }
                await dispatch(importExtraDataThunk(fileContents));
            }}
            setInProgress={(progressState: boolean) => {}}
            variant="outline-primary"
            title="Import data into the drafting interface (e.g., subsequent appointment data or a previous draft)"
        >
            <BsUpload /> Import Draft Data
        </ImportButton>
    );
}
