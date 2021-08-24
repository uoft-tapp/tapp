import React from "react";
import { Alert } from "react-bootstrap";
import { useSelector } from "react-redux";
import { assignmentsSelector, applicantsSelector } from "../../../api/actions";
import { ddahsSelector, upsertDdahs } from "../../../api/actions/ddahs";
import {
    Ddah,
    Assignment,
    Applicant,
    MinimalDdah,
    RawDuty,
    Duty,
} from "../../../api/defs/types";
import { ImportActionButton } from "../../../components/import-button";
import { DiffSpec, diffImport, getChanged } from "../../../libs/diffs";
import { normalizeDdahImports } from "../../../libs/import-export";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

enum DiffType {
    Unchanged = "UNCHANGED",
    Created = "CREATED",
    Updated = "UPDATED",
    Deleted = "DELETED",
}

type MinimalDuty = Omit<Duty, "order">;

interface DdahUpdate {
    updatedDdah: Ddah;
    oldDdah: Ddah;
}

interface DutyDiff {
    oldDuty?: MinimalDuty;
    newDuty?: MinimalDuty;
    status: DiffType;
}

function getDutiesDiff(oldDuties: RawDuty[], newDuties: RawDuty[]): DutyDiff[] {
    let changes: DutyDiff[] = [];
    let dutiesChanged = false;

    oldDuties.forEach((oldDuty) => {
        let oldDutyDeleted = true;

        newDuties.forEach((newDuty, index) => {
            if (
                oldDuty.description === newDuty.description &&
                oldDuty.hours === newDuty.hours
            ) {
                changes.push({ oldDuty, newDuty, status: DiffType.Unchanged });
                newDuties.splice(index, 1);
                oldDutyDeleted = false;
            } else if (
                oldDuty.description === newDuty.description &&
                oldDuty.hours !== newDuty.hours
            ) {
                changes.push({ oldDuty, newDuty, status: DiffType.Updated });
                newDuties.splice(index, 1);
                oldDutyDeleted = false;
                dutiesChanged = true;
            }
        });

        // If we did not find old duties to match the new one - mark it as created
        if (oldDutyDeleted) {
            changes.push({ oldDuty, status: DiffType.Deleted });
            dutiesChanged = true;
        }
    });

    // The new duties that are left were just created - add them
    newDuties.forEach((duty) =>
        changes.push({ newDuty: duty, status: DiffType.Created })
    );

    // Do not return changes if everything is unchanged
    return dutiesChanged ? changes : [];
}

function DutiesDiffList({ changes }: { changes: DutyDiff[] }) {
    return (
        <ul>
            {changes.map(({ oldDuty, newDuty, status }) => {
                switch (status) {
                    case DiffType.Unchanged:
                        return (
                            <li className="duty-unchanged">
                                {oldDuty!.description} - {oldDuty!.hours}h
                            </li>
                        );
                    case DiffType.Updated:
                        return (
                            <li className="duty-updated">
                                {oldDuty!.description} - {oldDuty!.hours}h
                                {" ➞ "}
                                {newDuty!.hours}h
                            </li>
                        );
                    case DiffType.Created:
                        return (
                            <li className="duty-created">
                                {newDuty!.description} - {newDuty!.hours}h
                            </li>
                        );
                    case DiffType.Deleted:
                        return (
                            <li className="duty-deleted">
                                {oldDuty!.description} - {oldDuty!.hours}h
                            </li>
                        );
                    default:
                        return null as never;
                }
            })}
        </ul>
    );
}

function DdahsList({ ddahs }: { ddahs: Omit<Ddah, "id">[] }) {
    return (
        <ul>
            {ddahs.map(({ assignment: { applicant }, duties }, i) => (
                <li>
                    DDAH for {applicant.first_name} {applicant.last_name} (
                    {applicant.utorid})
                    <ul className="instructor-ddah-import-new-ddah-duties-list">
                        {duties.map((duty) => (
                            <li key={`ddah-new-${i}`}>
                                {duty.description} - {duty.hours}h
                            </li>
                        ))}
                    </ul>
                </li>
            ))}
        </ul>
    );
}

function DdahsDiffList({ ddahUpdates }: { ddahUpdates: DdahUpdate[] }) {
    return (
        <ul className="instructor-ddah-import-duties-diff-list">
            {ddahUpdates.map(({ oldDdah, updatedDdah }, i) => {
                const dutiesDiff = getDutiesDiff(
                    oldDdah.duties,
                    updatedDdah.duties
                );
                const { assignment } = updatedDdah;
                const { applicant } = assignment;
                const { first_name, last_name, utorid } = applicant;
                return (
                    <li key={`ddah-diff-${i}`}>
                        DDAH for {first_name} {last_name} ({utorid})
                        <DutiesDiffList changes={dutiesDiff} />
                    </li>
                );
            })}
        </ul>
    );
}

export function InstructorImportDdahsAction({
    disabled = false,
    setImportInProgress = null,
}: {
    disabled: boolean;
    setImportInProgress?: Function | null;
}) {
    const dispatch = useThunkDispatch();
    const ddahs = useSelector<any, Ddah[]>(ddahsSelector);
    const assignments = useSelector<any, Assignment[]>(assignmentsSelector);
    const applicants = useSelector<any, Applicant[]>(applicantsSelector);
    const [fileContent, setFileContent] = React.useState<{
        fileType: "json" | "spreadsheet";
        data: any;
    } | null>(null);
    const [diffed, setDiffed] = React.useState<
        DiffSpec<MinimalDdah, Ddah>[] | null
    >(null);
    const [newDdahs, setNewDdahs] = React.useState<(Ddah | Omit<Ddah, "id">)[]>(
        []
    );
    const [ddahUpdates, setDdahUpdates] = React.useState<DdahUpdate[]>([]);
    const [processingError, setProcessingError] = React.useState(null);
    const [inProgress, _setInProgress] = React.useState(false);

    function setInProgress(state: boolean) {
        _setInProgress(state);
        if (typeof setImportInProgress === "function") {
            setImportInProgress(state);
        }
    }

    // Make sure we aren't showing any diff if there's no file loaded.
    React.useEffect(() => {
        if (!fileContent) {
            if (diffed) {
                setDiffed(null);
            }
        }
    }, [diffed, setDiffed, fileContent]);

    // Recompute the diff every time the file changes
    React.useEffect(() => {
        // If we have no file or we are currently in the middle of processing another file,
        // do nothing.
        if (!fileContent || inProgress) {
            return;
        }
        try {
            setProcessingError(null);
            // normalize the data coming from the file
            const data = normalizeDdahImports(fileContent, applicants);

            // Compute which DDAHs have been added/modified
            const newDiff = diffImport.ddahs(data, { ddahs, assignments });
            const newDdahs = newDiff
                .filter((diff) => diff.status === "new")
                .map((diff) => diff.obj);
            const modifiedDdahs = newDiff
                .filter((diff) => diff.status === "modified")
                .map((diff) => diff.obj as Ddah);
            const ddahUpdates = modifiedDdahs.map((modifiedDdah) => ({
                updatedDdah: modifiedDdah,
                oldDdah: ddahs.find(
                    (ddah) => ddah.id === modifiedDdah.id
                ) as Ddah,
            }));
            setNewDdahs(newDdahs);
            setDdahUpdates(ddahUpdates);
            setDiffed(newDiff);
        } catch (e) {
            console.warn(e);
            setProcessingError(e);
        }
    }, [fileContent, ddahs, assignments, applicants, inProgress]);

    async function onConfirm() {
        if (!diffed) {
            throw new Error("Unable to compute an appropriate diff");
        }
        const changedDdahs = getChanged(diffed);

        await dispatch(upsertDdahs(changedDdahs));

        setFileContent(null);
    }

    return (
        <ImportActionButton
            onConfirm={onConfirm}
            onFileChange={setFileContent}
            dialogContent={
                <DialogContent
                    processingError={processingError}
                    newDdahs={newDdahs}
                    ddahUpdates={ddahUpdates}
                    fileLoaded={!!diffed}
                />
            }
            setInProgress={setInProgress}
            disabled={disabled}
        ></ImportActionButton>
    );
}

const DialogContent = React.memo(function DialogContent({
    processingError,
    newDdahs,
    ddahUpdates,
    fileLoaded,
}: {
    processingError: string | null;
    newDdahs: (Ddah | Omit<Ddah, "id">)[];
    ddahUpdates: DdahUpdate[];
    fileLoaded: boolean;
}) {
    if (processingError) {
        return <Alert variant="danger">{"" + processingError}</Alert>;
    }

    if (!fileLoaded) {
        return <p>No data loaded.</p>;
    }

    if (newDdahs.length === 0 && ddahUpdates.length === 0) {
        return (
            <Alert variant="warning">
                No difference between imported and existing DDAHs.
            </Alert>
        );
    }

    return (
        <React.Fragment>
            {newDdahs.length > 0 && (
                <Alert variant="primary">
                    <span className="mb-1">
                        The following DDAHs will be <strong>added</strong>
                    </span>
                    <DdahsList ddahs={newDdahs} />
                </Alert>
            )}
            {ddahUpdates.length > 0 && (
                <Alert variant="info">
                    <span className="mb-1">
                        The following DDAHs will be <strong>modified</strong>
                    </span>
                    <DdahsDiffList ddahUpdates={ddahUpdates} />
                </Alert>
            )}
        </React.Fragment>
    );
});
