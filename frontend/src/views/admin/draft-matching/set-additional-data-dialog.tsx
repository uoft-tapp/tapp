import React from "react";
import { Button, Modal, Tab, Tabs } from "react-bootstrap";
import { BsCalendar } from "react-icons/bs";
import {
    selfSelector,
    draftMatchingSlice,
    ApplicantAnnotation,
} from "./state/slice";
import { useSelector } from "react-redux";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

/**
 * Take delimited text and turn it into an array based on many valid separators.
 */
function makeArray(str: string): string[] {
    return str
        .split(/\s+|[,;]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
}

/**
 * Open a dialog to set additional data for draft matching. This includes
 * a show list, a hide list, and subsequent appointment data (i.e. hour ranges).
 */
export function AdditionalDataButton() {
    const [showDialog, setShowDialog] = React.useState(false);
    const allData = useSelector(selfSelector);
    const currentShowList = React.useMemo(
        () => new Set(allData.showList),
        [allData.showList]
    );
    const currentHideList = React.useMemo(
        () => new Set(allData.hideList),
        [allData.hideList]
    );
    const [showListText, setShowListText] = React.useState(
        allData.showList.join("\n")
    );
    const [hideListText, setHideListText] = React.useState(
        allData.hideList.join("\n")
    );
    const [desiredHoursText, setDesiredHoursText] = React.useState(
        desiredHoursJSONToTable(allData.desiredHoursByUtorid)
    );
    const [generalAnnotationsText, setGeneralAnnotationsText] = React.useState(
        generalAnnotationsToTable(allData.annotationsByUtorid)
    );
    const [fTermListText, setFTermListText] = React.useState(
        blanketListToText(allData.annotationsByUtorid, "fTermTeaching")
    );
    const [fTermBlanketText, setFTermBlanketText] = React.useState(
        deriveBlanketText(allData.annotationsByUtorid, "fTermTeaching", "F")
    );
    const [sTermListText, setSTermListText] = React.useState(
        blanketListToText(allData.annotationsByUtorid, "sTermTeaching")
    );
    const [sTermBlanketText, setSTermBlanketText] = React.useState(
        deriveBlanketText(allData.annotationsByUtorid, "sTermTeaching", "S")
    );
    const [changes, setChanges] = React.useState({
        showList: false,
        hideList: false,
        desiredHours: false,
        annotations: false,
    });
    const dispatch = useThunkDispatch();

    // Compute whether there are any changes
    const anyChanges =
        changes.showList ||
        changes.hideList ||
        changes.desiredHours ||
        changes.annotations;

    // Human-friendly save button label based on what changed
    const saveButtonLabel = React.useMemo(() => {
        const parts = [];
        if (changes.showList) {
            parts.push("Show List");
        }
        if (changes.hideList) {
            parts.push("Hide List");
        }
        if (changes.desiredHours) {
            parts.push("Desired Hours");
        }
        if (changes.annotations) {
            parts.push("Annotations");
        }
        return parts.length > 0 ? `Save ${parts.join(" & ")}` : "Save";
    }, [
        changes.showList,
        changes.hideList,
        changes.desiredHours,
        changes.annotations,
    ]);

    function handleSave() {
        // Prepare sorted arrays from the textarea input
        const newShowList = Array.from(new Set(makeArray(showListText))).sort();
        const newHideList = Array.from(new Set(makeArray(hideListText))).sort();
        const desiredHoursByUtorid = desiredHoursTableToJSON(desiredHoursText);
        // Build the final annotations record from the three inputs: the manual "general"
        // table, and the F/S term utorid lists with their blanket annotation text. This
        // fully replaces the previous state, like the Show/Hide lists do.
        const newAnnotationsByUtorid = buildAnnotationsByUtorid(
            generalAnnotationsTableToJSON(generalAnnotationsText),
            Array.from(new Set(makeArray(fTermListText))),
            fTermBlanketText,
            Array.from(new Set(makeArray(sTermListText))),
            sTermBlanketText
        );
        // Dispatch updates
        dispatch(draftMatchingSlice.actions.setShowList(newShowList));
        dispatch(draftMatchingSlice.actions.setHideList(newHideList));
        dispatch(
            draftMatchingSlice.actions.setDesiredHoursByUtorid(
                desiredHoursByUtorid
            )
        );
        dispatch(
            draftMatchingSlice.actions.setAnnotationsByUtorid(
                newAnnotationsByUtorid
            )
        );
        // Close dialog
        setShowDialog(false);
    }

    React.useEffect(() => {
        setDesiredHoursText(
            desiredHoursJSONToTable(allData.desiredHoursByUtorid)
        );
    }, [allData.desiredHoursByUtorid]);

    React.useEffect(() => {
        setGeneralAnnotationsText(
            generalAnnotationsToTable(allData.annotationsByUtorid)
        );
        setFTermListText(
            blanketListToText(allData.annotationsByUtorid, "fTermTeaching")
        );
        setFTermBlanketText(
            deriveBlanketText(allData.annotationsByUtorid, "fTermTeaching", "F")
        );
        setSTermListText(
            blanketListToText(allData.annotationsByUtorid, "sTermTeaching")
        );
        setSTermBlanketText(
            deriveBlanketText(allData.annotationsByUtorid, "sTermTeaching", "S")
        );
    }, [allData.annotationsByUtorid]);

    React.useEffect(() => {
        // If the dialog is hidden, reset the text fields.
        if (!showDialog) {
            // Sort the utorids before we turn them into lists
            const sortedShowList = Array.from(currentShowList).sort();
            const sortedHideList = Array.from(currentHideList).sort();
            setShowListText(sortedShowList.join("\n"));
            setHideListText(sortedHideList.join("\n"));
            // The F/S term utorid lists are persisted (not ephemeral), so they get
            // re-derived from the current annotations rather than cleared.
            setGeneralAnnotationsText(
                generalAnnotationsToTable(allData.annotationsByUtorid)
            );
            setFTermListText(
                blanketListToText(allData.annotationsByUtorid, "fTermTeaching")
            );
            setFTermBlanketText(
                deriveBlanketText(
                    allData.annotationsByUtorid,
                    "fTermTeaching",
                    "F"
                )
            );
            setSTermListText(
                blanketListToText(allData.annotationsByUtorid, "sTermTeaching")
            );
            setSTermBlanketText(
                deriveBlanketText(
                    allData.annotationsByUtorid,
                    "sTermTeaching",
                    "S"
                )
            );
            return;
        }
    }, [
        currentShowList,
        currentHideList,
        showDialog,
        allData.annotationsByUtorid,
    ]);

    React.useEffect(() => {
        // Check to see if either the show list or the hide list has been changed.
        const newShowList = new Set(makeArray(showListText));
        const newHideList = new Set(makeArray(hideListText));
        const showListChanged =
            newShowList.size !== currentShowList.size ||
            Array.from(newShowList).some((s) => !currentShowList.has(s));
        const hideListChanged =
            newHideList.size !== currentHideList.size ||
            Array.from(newHideList).some((s) => !currentHideList.has(s));
        const desiredHoursChanged =
            desiredHoursText !==
            desiredHoursJSONToTable(allData.desiredHoursByUtorid);
        const annotationsChanged =
            generalAnnotationsText !==
                generalAnnotationsToTable(allData.annotationsByUtorid) ||
            fTermListText !==
                blanketListToText(
                    allData.annotationsByUtorid,
                    "fTermTeaching"
                ) ||
            fTermBlanketText !==
                deriveBlanketText(
                    allData.annotationsByUtorid,
                    "fTermTeaching",
                    "F"
                ) ||
            sTermListText !==
                blanketListToText(
                    allData.annotationsByUtorid,
                    "sTermTeaching"
                ) ||
            sTermBlanketText !==
                deriveBlanketText(
                    allData.annotationsByUtorid,
                    "sTermTeaching",
                    "S"
                );
        setChanges({
            showList: showListChanged,
            hideList: hideListChanged,
            desiredHours: desiredHoursChanged,
            annotations: annotationsChanged,
        });
    }, [
        showListText,
        hideListText,
        desiredHoursText,
        generalAnnotationsText,
        fTermListText,
        fTermBlanketText,
        sTermListText,
        sTermBlanketText,
        currentHideList,
        currentShowList,
        allData.desiredHoursByUtorid,
        allData.annotationsByUtorid,
    ]);

    return (
        <>
            <Modal
                show={showDialog}
                onHide={() => setShowDialog(false)}
                size="xl"
                className="additional-data-dialog"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Set Additional Data</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs
                        defaultActiveKey="desired-hours"
                        id="additional-data-tabs"
                    >
                        <Tab eventKey="desired-hours" title="Desired Hours">
                            <p className="mb-0">
                                Enter desired minimum and maximum hours for
                                applicants (for example, to track subsequent
                                appointment fulfillment).
                            </p>
                            <p className="mt-0.5">
                                Data should be{" "}
                                <b className="mx-2">
                                    <code>utorid</code>
                                </b>{" "}
                                <b className="mx-2">Min Hours</b>{" "}
                                <b className="mx-2">Max Hours</b>, one entry per
                                line.
                            </p>
                            <div className="desired-hours-input">
                                <textarea
                                    value={desiredHoursText}
                                    onChange={(e) =>
                                        setDesiredHoursText(e.target.value)
                                    }
                                    placeholder={`e.g.\nutorid1\t10\t20\nutorid2\t5\t15`}
                                />
                            </div>
                        </Tab>
                        <Tab eventKey="show-hide-lists" title="Show/Hide Lists">
                            <p>
                                Below are lists of utorids of applicants that
                                you want to show or hide. This is useful to hide
                                applicants that you've determined are
                                ineligible/not qualified for any position.
                            </p>
                            <div className="show-hide-lists">
                                <div className="list">
                                    <div>Show List</div>
                                    <textarea
                                        value={showListText}
                                        onChange={(e) =>
                                            setShowListText(e.target.value)
                                        }
                                        placeholder="Enter one utorid per line"
                                    />
                                </div>
                                <div className="list">
                                    <div>Hide List</div>
                                    <textarea
                                        value={hideListText}
                                        onChange={(e) =>
                                            setHideListText(e.target.value)
                                        }
                                        placeholder="Enter one utorid per line"
                                    />
                                </div>
                            </div>
                        </Tab>
                        <Tab eventKey="annotations" title="Annotations">
                            <p className="mb-0">
                                Enter short annotation tags for applicants
                                (shown on their pill in the board, before their
                                name). Annotations are short tags with no spaces
                                (e.g. "x" or "*"). If an applicant has both a
                                manual entry and an F/S term annotation below,
                                they are combined dynamically wherever they're
                                displayed.
                            </p>
                            <p className="mt-0.5">
                                Data should be{" "}
                                <b className="mx-2">
                                    <code>utorid</code>
                                </b>{" "}
                                followed by a space (or tab) and then the
                                annotation tag, one entry per line.
                            </p>
                            <div className="annotations-input">
                                <textarea
                                    value={generalAnnotationsText}
                                    onChange={(e) =>
                                        setGeneralAnnotationsText(
                                            e.target.value
                                        )
                                    }
                                    placeholder={`e.g.\nutorid1 x\nutorid2 *`}
                                />
                            </div>
                            <p className="mt-2 mb-0">
                                Applicants teaching in the Fall or Spring term
                                can be given a blanket annotation below (e.g. a
                                short tag like "F" or "S").
                            </p>
                            <div className="blanket-annotation-lists">
                                <div className="list">
                                    <div>Teaching Assigned - F Term</div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={fTermBlanketText}
                                        onChange={(e) =>
                                            setFTermBlanketText(e.target.value)
                                        }
                                        placeholder="Blanket annotation text"
                                    />
                                    <textarea
                                        value={fTermListText}
                                        onChange={(e) =>
                                            setFTermListText(e.target.value)
                                        }
                                        placeholder="Enter one utorid per line"
                                    />
                                </div>
                                <div className="list">
                                    <div>Teaching Assigned - S Term</div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={sTermBlanketText}
                                        onChange={(e) =>
                                            setSTermBlanketText(e.target.value)
                                        }
                                        placeholder="Blanket annotation text"
                                    />
                                    <textarea
                                        value={sTermListText}
                                        onChange={(e) =>
                                            setSTermListText(e.target.value)
                                        }
                                        placeholder="Enter one utorid per line"
                                    />
                                </div>
                            </div>
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowDialog(false)}
                    >
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={!anyChanges}
                    >
                        {saveButtonLabel}
                    </Button>
                </Modal.Footer>
            </Modal>
            <Button
                variant="outline-secondary"
                className="ms-2"
                onClick={() => setShowDialog(true)}
                title="Set additional data such as show/hide lists and subsequent appointment data"
            >
                <BsCalendar /> Additional Data
            </Button>
        </>
    );
}

type DesiredHoursRecord = Record<
    string,
    { minHours: number; maxHours: number }
>;

/**
 * Convert a table `utorid minHours maxHours` into a Javascript object.
 */
function desiredHoursTableToJSON(desiredHoursText: string): DesiredHoursRecord {
    const desiredHoursByUtorid: DesiredHoursRecord = {};
    desiredHoursText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l)
        .forEach((line) => {
            const [utorid, minHoursStr, maxHoursStr] = makeArray(line);
            const minHours = parseFloat(minHoursStr);
            const maxHours = parseFloat(maxHoursStr);
            if (utorid && !isNaN(minHours) && !isNaN(maxHours)) {
                desiredHoursByUtorid[utorid] = { minHours, maxHours };
            }
        });
    return desiredHoursByUtorid;
}

/**
 * Convert a Javascript object of the form `Record<utorid, { minHours, maxHours }>` into a table string of the form `utorid minHours maxHours`.
 */
function desiredHoursJSONToTable(
    desiredHoursByUtorid: DesiredHoursRecord
): string {
    return Object.entries(desiredHoursByUtorid)
        .map(
            ([utorid, hours]) =>
                `${utorid}\t${hours.minHours}\t${hours.maxHours}`
        )
        .join("\n");
}

/**
 * Convert a table of `utorid annotation` (utorid and annotation separated by any whitespace,
 * one entry per line) into a Javascript object mapping utorid to its "general" annotation tag.
 * Annotations are expected to be a single whitespace-free token (e.g. "x" or "*"), so only the
 * first two whitespace-separated tokens on each line are used.
 */
function generalAnnotationsTableToJSON(text: string): Record<string, string> {
    const result: Record<string, string> = {};
    text.split("\n")
        .map((l) => l.trim())
        .filter((l) => l)
        .forEach((line) => {
            const [utorid, annotation] = line.split(/\s+/).filter(Boolean);
            if (utorid && annotation) {
                result[utorid] = annotation;
            }
        });
    return result;
}

/**
 * Convert a Javascript object of the form `Record<utorid, ApplicantAnnotation>` into a table
 * string of the form `utorid annotation`, one line per utorid that has a "general" annotation.
 */
function generalAnnotationsToTable(
    annotationsByUtorid: Record<string, ApplicantAnnotation>
): string {
    return Object.entries(annotationsByUtorid)
        .filter(([, annotation]) => annotation.general)
        .map(([utorid, annotation]) => `${utorid} ${annotation.general}`)
        .sort()
        .join("\n");
}

/**
 * List (one utorid per line) the utorids that currently have a value set for the given
 * annotation field (e.g. "fTermTeaching" or "sTermTeaching").
 */
function blanketListToText(
    annotationsByUtorid: Record<string, ApplicantAnnotation>,
    field: "fTermTeaching" | "sTermTeaching"
): string {
    return Object.entries(annotationsByUtorid)
        .filter(([, annotation]) => annotation[field])
        .map(([utorid]) => utorid)
        .sort()
        .join("\n");
}

/**
 * Derive the blanket annotation text currently in use for the given field, by reading it off
 * any utorid that already has that field set (this dialog always assigns the same blanket text
 * to every utorid in a given list). Falls back to `fallback` if no utorid has the field set.
 */
function deriveBlanketText(
    annotationsByUtorid: Record<string, ApplicantAnnotation>,
    field: "fTermTeaching" | "sTermTeaching",
    fallback: string
): string {
    const existing = Object.values(annotationsByUtorid).find(
        (annotation) => annotation[field]
    );
    return existing?.[field] || fallback;
}

/**
 * Build the final `annotationsByUtorid` record from the dialog's three inputs: the manual
 * "general" table, and the F/S term utorid lists with their blanket annotation text. This
 * fully replaces the previous state (like the Show/Hide lists do), so removing a utorid from
 * one of these inputs and saving clears that part of its annotation.
 */
function buildAnnotationsByUtorid(
    generalByUtorid: Record<string, string>,
    fTermUtorids: string[],
    fTermBlanketText: string,
    sTermUtorids: string[],
    sTermBlanketText: string
): Record<string, ApplicantAnnotation> {
    const fTermSet = new Set(fTermUtorids);
    const sTermSet = new Set(sTermUtorids);
    const trimmedFTermText = fTermBlanketText.trim();
    const trimmedSTermText = sTermBlanketText.trim();
    const allUtorids = new Set([
        ...Object.keys(generalByUtorid),
        ...fTermSet,
        ...sTermSet,
    ]);
    const result: Record<string, ApplicantAnnotation> = {};
    allUtorids.forEach((utorid) => {
        const annotation: ApplicantAnnotation = {};
        if (generalByUtorid[utorid]) {
            annotation.general = generalByUtorid[utorid];
        }
        if (fTermSet.has(utorid) && trimmedFTermText) {
            annotation.fTermTeaching = trimmedFTermText;
        }
        if (sTermSet.has(utorid) && trimmedSTermText) {
            annotation.sTermTeaching = trimmedSTermText;
        }
        // Only keep utorids that ended up with at least one annotation part set.
        if (
            annotation.general ||
            annotation.fTermTeaching ||
            annotation.sTermTeaching
        ) {
            result[utorid] = annotation;
        }
    });
    return result;
}
