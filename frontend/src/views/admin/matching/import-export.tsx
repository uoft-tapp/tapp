import React from "react";
import FileSaver from "file-saver";
import { matchingDataSelector } from "./actions";
import { useSelector } from "react-redux";
import { Modal, Button, Row, Form, Col } from "react-bootstrap";
import { DataFormat } from "../../../libs/import-export";
import { BsCircleFill } from "react-icons/bs";
import { Match, AppointmentGuaranteeStatus } from "./types";
import { upsertMatch, batchUpsertGuarantees } from "./actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

export function ExportMatchingDataButton({
    markAsUpdated,
    setMarkAsUpdated,
}: {
    markAsUpdated: boolean;
    setMarkAsUpdated: Function;
}) {
    const matchingData = useSelector(matchingDataSelector);

    function onClick() {
        const blob = new Blob([JSON.stringify(matchingData)], {
            type: "text/plain;charset=utf-8",
        });
        const date = new Date();
        FileSaver.saveAs(
            blob,
            "matching_data-" +
                date.getFullYear() +
                "-" +
                date.getMonth().toString().padStart(2, "0") +
                "-" +
                date.getDate().toString().padStart(2, "0") +
                "-" +
                date.getHours().toString().padStart(2, "0") +
                "-" +
                date.getMinutes().toString().padStart(2, "0") +
                "-" +
                date.getSeconds().toString().padStart(2, "0") +
                ".json"
        );
        setMarkAsUpdated(false);
    }

    return (
        <Button
            variant="outline-primary"
            size="sm"
            className="footer-button"
            onClick={onClick}
        >
            {markAsUpdated && (
                <div className="change-icon">
                    <BsCircleFill />
                </div>
            )}
            Export Data
        </Button>
    );
}

export function ImportMatchingDataButton({
    setMarkAsUpdated,
}: {
    setMarkAsUpdated: Function;
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
            if (Object.keys(fileContent.data).includes("matches")) {
                // Filter matches based on whether
                // - the utorid and positionId combo don't exist at all in the current matching data set, or
                // - the combination exists but the assignment status or hoursAssigned is different
                const diffedMatches = fileContent.data.matches.filter(
                    (newMatch: Match) =>
                        !matchingData.matches.find(
                            (oldMatch: Match) =>
                                oldMatch.utorid === newMatch.utorid &&
                                oldMatch.positionId === newMatch.positionId
                        ) ||
                        matchingData.matches.find(
                            (oldMatch: Match) =>
                                oldMatch.utorid === newMatch.utorid &&
                                oldMatch.positionId === newMatch.positionId &&
                                oldMatch.status !== "assigned" &&
                                (oldMatch.status !== newMatch.status ||
                                    oldMatch.hoursAssigned !==
                                        newMatch.hoursAssigned)
                        )
                );

                setDiffedMatches(diffedMatches);
            }

            if (Object.keys(fileContent.data).includes("guarantees")) {
                setNewGuarantees(
                    fileContent.data.guarantees.map(
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

    function _onConfirm() {
        if (diffedMatches) {
            for (const match of diffedMatches) {
                updateMatch(match);
            }
        }

        if (newGuarantees) {
            updateGuarantees(newGuarantees);
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
    setMarkAsUpdated,
}: {
    setMarkAsUpdated: Function;
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
            setMarkAsUpdated(true);
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
