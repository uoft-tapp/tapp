import React from "react";
import { Modal, Button, Row, Form, Col } from "react-bootstrap";
import { DataFormat } from "../../../../libs/import-export";
import { AppointmentGuaranteeStatus } from "../types";
import { batchUpsertGuarantees } from "../actions";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";

export function ImportGuaranteesButton() {
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

    function _onConfirm() {
        if (newGuarantees) {
            dispatch(batchUpsertGuarantees(newGuarantees));
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
