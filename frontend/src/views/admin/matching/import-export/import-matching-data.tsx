import React from "react";
import { matchesSelector } from "../actions";
import { useSelector } from "react-redux";
import { Modal, Button, Row, Form, Col, Alert } from "react-bootstrap";
import { DataFormat } from "../../../../libs/import-export";
import { Match, AppointmentGuaranteeStatus } from "../types";
import { upsertMatch, batchUpsertGuarantees, upsertNote } from "../actions";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";

export function ImportMatchingDataButton() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
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

    const [warningMessage, setWarningMessage] = React.useState("");

    const matches = useSelector(matchesSelector);
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
                const warning = `File of unexpected type ${typeof e.target
                    ?.result}`;
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
        } catch (e) {}
        const warning = `Could not determine file type for ${fileInputLabel}`;
        setWarningMessage(warning);
        console.warn(warning);
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

        setAddDialogVisible(false);
    }

    return (
        <>
            <Button
                variant="outline-primary"
                size="sm"
                className="footer-button"
                onClick={() => setAddDialogVisible(true)}
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
                    {warningMessage && (
                        <Alert variant="warning">{warningMessage}</Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => setAddDialogVisible(false)}
                        variant="light"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={_onConfirm}
                        disabled={!!warningMessage.length}
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
