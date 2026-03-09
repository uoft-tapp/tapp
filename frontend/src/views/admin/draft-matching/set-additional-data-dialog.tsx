import React from "react";
import { Button, Modal, Tab, Tabs } from "react-bootstrap";
import { BsCalendar } from "react-icons/bs";
import { selfSelector, draftMatchingSlice } from "./state/slice";
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
    const [changes, setChanges] = React.useState({
        showList: false,
        hideList: false,
        desiredHours: false,
    });
    const dispatch = useThunkDispatch();

    // Compute whether there are any changes
    const anyChanges =
        changes.showList || changes.hideList || changes.desiredHours;

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
        return parts.length > 0 ? `Save ${parts.join(" & ")}` : "Save";
    }, [changes.showList, changes.hideList, changes.desiredHours]);

    function handleSave() {
        // Prepare sorted arrays from the textarea input
        const newShowList = Array.from(new Set(makeArray(showListText))).sort();
        const newHideList = Array.from(new Set(makeArray(hideListText))).sort();
        const desiredHoursByUtorid = desiredHoursTableToJSON(desiredHoursText);
        // Dispatch updates
        dispatch(draftMatchingSlice.actions.setShowList(newShowList));
        dispatch(draftMatchingSlice.actions.setHideList(newHideList));
        dispatch(
            draftMatchingSlice.actions.setDesiredHoursByUtorid(
                desiredHoursByUtorid
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
        // If the dialog is hidden, reset the text fields.
        if (!showDialog) {
            // Sort the utorids before we turn them into lists
            const sortedShowList = Array.from(currentShowList).sort();
            const sortedHideList = Array.from(currentHideList).sort();
            setShowListText(sortedShowList.join("\n"));
            setHideListText(sortedHideList.join("\n"));
            return;
        }
    }, [currentShowList, currentHideList, showDialog]);

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
        setChanges({
            showList: showListChanged,
            hideList: hideListChanged,
            desiredHours: desiredHoursChanged,
        });
    }, [
        showListText,
        hideListText,
        desiredHoursText,
        currentHideList,
        currentShowList,
        allData.desiredHoursByUtorid,
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
