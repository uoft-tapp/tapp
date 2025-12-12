import React from "react";
import { Modal, Button, Row, Form, Col, Alert } from "react-bootstrap";
import { DataFormat } from "../../../../libs/import-export";
import { AppointmentGuaranteeStatus } from "../types";
import { batchUpsertGuarantees } from "../actions";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";

/**
 * A button that displays a modal to allow users to upload JSON files
 * with information about subsequent appointment guarantees to be upserted.
 */
export function ImportGuaranteesButton() {
    const [addDialog, setAddDialog] = React.useState(false);

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
    const [warningMessage, setWarningMessage] = React.useState("");

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
            console.warn(warning);
            setWarningMessage(warning);
        }
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
                            minHoursOwed: guarantee.minHoursOwed,
                            maxHoursOwed: guarantee.maxHoursOwed,
                            previousHoursFulfilled:
                                guarantee.previousHoursFulfilled,
                        } as AppointmentGuaranteeStatus;
                    }
                )
            );
            setWarningMessage("");
            return;
        } catch (e: any) {
            const warning = `Could not parse data for ${fileInputLabel}, check content format`;
            setWarningMessage(warning);
            console.warn(warning);
        }
    }, [fileContent, fileInputLabel]);

    const dispatch = useThunkDispatch();

    function _onConfirm() {
        if (newGuarantees) {
            dispatch(batchUpsertGuarantees(newGuarantees));
        }

        setFileArrayBuffer(null);
        setFileContent(null);
        setFileInputLabel(defaultLabel);

        setAddDialog(false);
    }

    return (
        <>
            <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setAddDialog(true)}
            >
                Import Sub. Appt. Data
            </Button>
            <Modal show={addDialog} onHide={() => setAddDialog(false)}>
                <Modal.Header>
                    <Modal.Title>
                        Import Subsequent Appointment Data
                    </Modal.Title>
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
