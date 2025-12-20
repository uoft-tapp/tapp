import React from "react";
import { rawMatchesSelector } from "../actions";
import { useSelector } from "react-redux";
import { Modal, Button, Row, Form, Col, Alert } from "react-bootstrap";
import { DataFormat } from "../../../../libs/import-export";
import { RawMatch, AppointmentGuaranteeStatus } from "../types";
import { upsertMatch, batchUpsertGuarantees, upsertNote } from "../actions";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";

export function ImportMatchingDataButton() {
    const [addDialog, setAddDialog] = React.useState(false);
    const defaultLabel = "Select a JSON file.";

    const [fileInputLabel, setFileInputLabel] = React.useState(defaultLabel);
    const [fileArrayBuffer, setFileArrayBuffer] =
        React.useState<ArrayBuffer | null>(null);
    const [fileContent, setFileContent] = React.useState<DataFormat | null>(
        null
    );
    const [diffedMatches, setDiffedMatches] = React.useState<RawMatch[] | null>(
        null
    );
    const [newGuarantees, setNewGuarantees] = React.useState<
        AppointmentGuaranteeStatus[] | null
    >(null);
    const [newNotes, setNewNotes] = React.useState<
        Record<string, string | null>
    >({});

    const [warningMessage, setWarningMessage] = React.useState("");

    const rawMatches = useSelector(rawMatchesSelector);
    const dispatch = useThunkDispatch();

    function _onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (!event.target || !event.target.files) {
            return;
        }
        const file = event.target.files[0];
        setFileInputLabel(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            if (!e.target || typeof e.target.result === "string") {
                const warning = "File of unexpected type";
                setWarningMessage(warning);
                console.warn(warning);
                return;
            }
            setWarningMessage("");
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
            setWarningMessage("");
            return;
            // eslint-disable-next-line
        } catch (e) {
            const warning = `Could not determine file type for ${fileInputLabel}`;
            setWarningMessage(warning);
            console.warn(warning);
        }
    }, [fileArrayBuffer, fileInputLabel]);

    React.useEffect(() => {
        if (!fileContent) {
            return;
        }
        try {
            if (fileContent.data["matches"]) {
                const diffedMatches = getDiffedMatches(
                    rawMatches,
                    fileContent.data["matches"]
                );
                setDiffedMatches(diffedMatches);
            }

            if (fileContent.data["guarantees"]) {
                setNewGuarantees(fileContent.data.guarantees);
            }

            if (fileContent.data["notes"]) {
                const importedNotes: Record<string, string | null> = {};
                for (const utorid in Object.keys(fileContent.data.notes)) {
                    importedNotes[utorid] = fileContent.data.notes[utorid];
                }

                setNewNotes(importedNotes);
            }
            setWarningMessage("");
            return;
        } catch (e: any) {
            const warning = `Could not parse data for ${fileInputLabel}, check content format`;
            setWarningMessage(warning);
            console.warn(warning);
        }
    }, [fileContent, rawMatches, fileInputLabel]);

    function _onConfirm() {
        if (diffedMatches) {
            for (const match of diffedMatches) {
                dispatch(upsertMatch(match));
            }
        }

        if (newGuarantees) {
            dispatch(batchUpsertGuarantees(newGuarantees));
        }

        if (newNotes) {
            for (const utorid in Object.keys(newNotes)) {
                dispatch(
                    upsertNote({ utorid: utorid, note: newNotes[utorid] })
                );
            }
        }

        setFileArrayBuffer(null);
        setFileContent(null);
        setFileInputLabel(defaultLabel);
        setWarningMessage("");

        setAddDialog(false);
    }

    return (
        <>
            <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setAddDialog(true)}
            >
                Import Data
            </Button>
            <Modal show={addDialog} onHide={() => setAddDialog(false)}>
                <Modal.Header>
                    <Modal.Title>Import Matching Data</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row className="mb-3">
                            <Col>
                                <Form.Group>
                                    <Form.Label>{fileInputLabel}</Form.Label>
                                    <Form.Control
                                        type="file"
                                        onChange={_onFileChange}
                                    ></Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                    {warningMessage && (
                        <Alert variant="warning">{warningMessage}</Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setAddDialog(false)} variant="light">
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={_onConfirm}
                        disabled={!!warningMessage || !fileContent}
                    >
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
function getDiffedMatches(oldMatchList: RawMatch[], newMatchList: RawMatch[]) {
    const oldMatchHash: Record<string, Record<string, RawMatch>> = {};
    for (const match of oldMatchList) {
        if (!oldMatchHash[match.utorid]) {
            oldMatchHash[match.utorid] = {};
        }

        oldMatchHash[match.utorid][match.positionCode] = match;
    }

    return newMatchList.filter((newMatch) => {
        // Keep this match if the utorid + position code combination don't already exist
        if (
            !oldMatchHash[newMatch.utorid] ||
            !oldMatchHash[newMatch.utorid][newMatch.positionCode]
        ) {
            return true;
        }

        // Combination exists, need to check if any values were modified:
        const oldMatch = oldMatchHash[newMatch.utorid][newMatch.positionCode];
        if (
            oldMatch.starred !== newMatch.starred ||
            oldMatch.hidden !== newMatch.hidden ||
            oldMatch.stagedAssigned !== newMatch.stagedAssigned ||
            oldMatch.stagedHoursAssigned !== newMatch.stagedHoursAssigned
        ) {
            return true;
        }

        return false;
    });
}
