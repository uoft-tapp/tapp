import React from "react";
import { matchesSelector } from "../actions";
import { useSelector } from "react-redux";
import { Modal, Button, Row, Form, Col } from "react-bootstrap";
import { DataFormat } from "../../../../libs/import-export";
import { Match, AppointmentGuaranteeStatus } from "../types";
import { upsertMatch, batchUpsertGuarantees, upsertNote } from "../actions";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";

export function ImportMatchingDataButton() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);

    function onClick() {
        setAddDialogVisible(true);
    }

    const defaultLabel = "Select a JSON file.";

    const [fileInputLabel, setFileInputLabel] = React.useState(defaultLabel);
    const [fileArrayBuffer, setFileArrayBuffer] =
        React.useState<ArrayBuffer | null>(null);
    const [fileContent, setFileContent] = React.useState<DataFormat | null>(
        null
    );
    const [diffedMatches, setDiffedMatches] = React.useState<Match[] | null>(
        null
    );
    const [newGuarantees, setNewGuarantees] = React.useState<
        AppointmentGuaranteeStatus[] | null
    >(null);
    const [newNotes, setNewNotes] = React.useState<
        Record<string, string | null>
    >({});

    const matches = useSelector(matchesSelector);

    function _onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (!event.target || !event.target.files) {
            return;
        }
        const file = event.target.files[0];
        setFileInputLabel(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            if (!e.target || typeof e.target.result === "string") {
                console.warn(
                    "File of unexpected type",
                    typeof e.target?.result
                );
                return;
            }
            setFileArrayBuffer(e.target.result);
        };
        reader.readAsArrayBuffer(file);
    }

    React.useEffect(() => {
        if (!fileArrayBuffer) {
            return;
        }

        const rawData = new Uint8Array(fileArrayBuffer);
        try {
            const str = new TextDecoder().decode(rawData);
            setFileContent({ data: JSON.parse(str), fileType: "json" });
            return;
            // eslint-disable-next-line
        } catch (e) {}

        console.warn(
            "Could not determine file type for",
            fileInputLabel,
            fileArrayBuffer
        );
    }, [fileArrayBuffer, fileInputLabel]);

    React.useEffect(() => {
        if (!fileContent) {
            return;
        }
        try {
            if (fileContent.data["matches"]) {
                const diffedMatches = getDiffedMatches(
                    fileContent.data["matches"],
                    matches
                );
                setDiffedMatches(diffedMatches);
            }

            if (fileContent.data["guarantees"]) {
                setNewGuarantees(
                    fileContent.data.guarantees.map(
                        (guarantee: AppointmentGuaranteeStatus) => {
                            return { ...guarantee };
                        }
                    )
                );
            }

            if (fileContent.data["notes"]) {
                const importedNotes: Record<string, string | null> = {};
                for (const utorid in Object.keys(fileContent.data.notes)) {
                    importedNotes[utorid] = fileContent.data.notes[utorid];
                }

                setNewNotes(importedNotes);
            }
        } catch (e: any) {
            console.warn(e);
        }
    }, [fileContent, matches]);

    const dispatch = useThunkDispatch();

    function _upsertMatch(match: Match | null) {
        if (!match) {
            return;
        }
        return dispatch(upsertMatch(match));
    }

    async function updateMatch(match: Match | null) {
        await _upsertMatch(match);
    }

    function _batchUpsertGuarantees(
        guarantees: AppointmentGuaranteeStatus[] | null
    ) {
        if (!guarantees) {
            return;
        }

        return dispatch(batchUpsertGuarantees(guarantees));
    }

    async function updateGuarantees(
        guarantees: AppointmentGuaranteeStatus[] | null
    ) {
        await _batchUpsertGuarantees(guarantees);
    }

    function _upsertNote(utorid: string, note: string | null) {
        return dispatch(upsertNote({ utorid: utorid, note: note }));
    }

    async function updateNotes(notes: Record<string, string | null>) {
        for (const utorid in Object.keys(notes)) {
            _upsertNote(utorid, notes[utorid]);
        }
    }

    function _onConfirm() {
        if (diffedMatches) {
            for (const match of diffedMatches) {
                updateMatch(match);
            }
        }

        if (newGuarantees) {
            updateGuarantees(newGuarantees);
        }

        if (newNotes) {
            updateNotes(newNotes);
        }

        setFileArrayBuffer(null);
        setFileContent(null);
        setFileInputLabel(defaultLabel);

        setAddDialogVisible(false);
    }

    return (
        <>
            <Button
                variant="outline-primary"
                size="sm"
                className="footer-button"
                onClick={onClick}
            >
                Import Data
            </Button>
            <Modal show={addDialogVisible}>
                <Modal.Header>
                    <Modal.Title>Import Matching Data</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row className="mb-3">
                            <Col>
                                <Form.File
                                    label={fileInputLabel}
                                    onChange={_onFileChange}
                                    custom
                                ></Form.File>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => setAddDialogVisible(false)}
                        variant="light"
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={_onConfirm}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

/**
 * Compares two lists of matches (`oldMatchList` and `newMatchList`) and returns a new list containing
 * only the matches from `newMatchList` where:
 * (a) the utorid and positionId combo don't exist at all in `oldMatchList`, or
 * (b) the combination exists but the assignment status or hoursAssigned is different
 */
function getDiffedMatches(oldMatchList: Match[], newMatchList: Match[]) {
    return newMatchList.filter(
        (newMatch: Match) =>
            !oldMatchList.find(
                // Remove matches whose utorid + position code combination already existed
                (oldMatch: Match) =>
                    oldMatch.utorid === newMatch.utorid &&
                    oldMatch.positionCode === newMatch.positionCode
            ) ||
            oldMatchList.find(
                // But keep matches that have had a value modified
                (oldMatch: Match) =>
                    oldMatch.utorid === newMatch.utorid &&
                    oldMatch.positionCode === newMatch.positionCode &&
                    oldMatch.status !== "assigned" &&
                    (oldMatch.status !== newMatch.status ||
                        oldMatch.hoursAssigned !== newMatch.hoursAssigned)
            )
    );
}
