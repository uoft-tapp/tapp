import React from "react";
import FileSaver from "file-saver";
import { matchingDataSelector } from "./actions";
import { useSelector } from "react-redux";
import { Modal, Button, Row, Form, Col } from "react-bootstrap";
import { DataFormat } from "../../../libs/import-export";
import { Match, AppointmentGuaranteeStatus } from "./types";
import { upsertMatch, batchUpsertGuarantees, upsertNote } from "./actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

export function ExportMatchingDataButton() {
    const matchingData = useSelector(matchingDataSelector);

    function onClick() {
        const blob = new Blob([JSON.stringify(matchingData, null, 4)], {
            type: "text/plain;charset=utf-8",
        });
        FileSaver.saveAs(
            blob,
            `matching_data-${new Date().toLocaleDateString("en-CA", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
            })}.json`
        );
    }

    return (
        <Button
            variant="outline-primary"
            size="sm"
            className="footer-button"
            onClick={onClick}
        >
            Export Data
        </Button>
    );
}

export function ImportMatchingDataButton({
    markAsUpdated,
}: {
    markAsUpdated: Function;
}) {
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

    const matchingData = useSelector(matchingDataSelector);

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
                // Filter matches based on whether
                // - the utorid and positionId combo don't exist at all in the current matching data set, or
                // - the combination exists but the assignment status or hoursAssigned is different
                const diffedMatches = fileContent.data.matches.filter(
                    (newMatch: Match) =>
                        !matchingData.matches.find(
                            (oldMatch: Match) =>
                                oldMatch.utorid === newMatch.utorid &&
                                oldMatch.positionCode === newMatch.positionCode
                        ) ||
                        matchingData.matches.find(
                            (oldMatch: Match) =>
                                oldMatch.utorid === newMatch.utorid &&
                                oldMatch.positionCode ===
                                    newMatch.positionCode &&
                                oldMatch.status !== "assigned" &&
                                (oldMatch.status !== newMatch.status ||
                                    oldMatch.hoursAssigned !==
                                        newMatch.hoursAssigned)
                        )
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
    }, [fileContent, matchingData.matches]);

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

export function ImportGuaranteesButton({
    markAsUpdated,
}: {
    markAsUpdated: Function;
}) {
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
    const [newGuarantees, setNewGuarantees] = React.useState<
        AppointmentGuaranteeStatus[] | null
    >(null);

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
            setNewGuarantees(
                fileContent.data.map(
                    (guarantee: AppointmentGuaranteeStatus) => {
                        return {
                            utorid: guarantee.utorid,
                            totalHoursOwed: guarantee.totalHoursOwed,
                            previousHoursFulfilled:
                                guarantee.previousHoursFulfilled,
                        } as AppointmentGuaranteeStatus;
                    }
                )
            );
        } catch (e: any) {
            console.warn(e);
        }
    }, [fileContent]);

    const dispatch = useThunkDispatch();

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

    function _onConfirm() {
        if (newGuarantees) {
            updateGuarantees(newGuarantees);
            markAsUpdated(true);
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
                Import Appt. Data
            </Button>
            <Modal show={addDialogVisible}>
                <Modal.Header>
                    <Modal.Title>Import Appointment Guarantee Data</Modal.Title>
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
