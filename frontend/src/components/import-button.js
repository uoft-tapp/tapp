import React, { useState } from "react";
import PropTypes from "prop-types";
import XLSX from "xlsx";
import {
    Button,
    Modal,
    Form,
    Spinner,
    Container,
    Row,
    Col,
} from "react-bootstrap";
import { ActionButton } from "./action-buttons";
import { FaUpload } from "react-icons/fa";

const DEFAULT_LABEL = "Select a spreadsheet, CSV, or JSON file.";

/**
 * A dialog for handling file input. The work of showing validation/content is handled by `dialogContent`.
 * This component handles displaying and parting a file specified by an <input type="file" /> node.
 *
 * @param {*} {
 *     dialogOpen,
 *     onCancel,
 *     onClose,
 *     onConfirm,
 *     dialogContent,
 *     onFileChange,
 * } - `onCancel` means the cancel button was clicked. `onClose` means the `x` was clicked or there was a click outside of the dialog window.
 * @returns
 */
function ImportDialog({
    dialogOpen,
    onCancel,
    onClose,
    onConfirm,
    dialogContent,
    onFileChange,
    setInProgress: parentSetInProgress,
}) {
    const [fileInputLabel, setFileInputLabel] = React.useState(DEFAULT_LABEL);
    const [fileArrayBuffer, setFileArrayBuffer] = React.useState(null);
    const [fileContents, setFileContents] = React.useState(null);
    const [inProgress, _setInProgress] = React.useState(false);

    // When we are processing we want to set a spinner button
    // in the dialog as well as communicate to our parent
    // that we are in the midst of processing. Therefore, we
    // call both the internal `setInProgress` function as well
    // as the one from our parent.
    function setInProgress(val) {
        _setInProgress(val);
        if (typeof parentSetInProgress === "function") {
            parentSetInProgress(val);
        }
    }

    if (!(onCancel instanceof Function)) {
        onCancel = () => console.warn("No onCancel function set for dialog");
    }

    // When file contents changes
    React.useEffect(() => {
        if (!fileContents) {
            return;
        }
        if (onFileChange instanceof Function) {
            onFileChange(fileContents);
        }
    }, [fileContents, onFileChange]);

    // Wrap the <input type="file" /> in an effect that parses the file
    React.useEffect(() => {
        if (!fileArrayBuffer) {
            return;
        }

        // Attempt to decode the file as JSON. If that doesn't work,
        // we process it as a spreadsheet.

        const rawData = new Uint8Array(fileArrayBuffer);
        try {
            const str = new TextDecoder().decode(rawData);
            setFileContents({ data: JSON.parse(str), fileType: "json" });
            return;
            // eslint-disable-next-line
        } catch (e) {}
        try {
            const workbook = XLSX.read(rawData, { type: "array" });
            const firstSheet = workbook.SheetNames[0];
            setFileContents({
                data: XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]),
                fileType: "spreadsheet",
            });
            return;
            // eslint-disable-next-line
        } catch (e) {}

        console.warn(
            "Could not determine file type for",
            fileInputLabel,
            fileArrayBuffer
        );
    }, [fileArrayBuffer, fileInputLabel]);

    function _onFileChange(event) {
        const file = event.target.files[0];
        setFileInputLabel(file.name);

        const reader = new FileReader();
        reader.onload = (e) => setFileArrayBuffer(e.target.result);
        reader.readAsArrayBuffer(file);
    }

    function _onConfirm() {
        if (!(onConfirm instanceof Function)) {
            return;
        }
        setInProgress(true);
        // We wrap `onConfirm` in an async function which will automatically
        // convert it to a promise if needed.
        (async () => onConfirm(fileContents))()
            .then(() => {
                setInProgress(false);
            })
            .catch(console.error)
            .finally(() => {
                setInProgress(false);
                setFileArrayBuffer(null);
                setFileContents(null);
                setFileInputLabel(DEFAULT_LABEL);
            });
    }

    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="mr-1" />
    ) : null;

    return (
        <Modal
            show={dialogOpen}
            onHide={onClose}
            size="lg"
            dialogClassName="wide-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>Import From File</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Container>
                    <Row className="mb-3">
                        <Col>
                            <Form>
                                <Form.File
                                    label={fileInputLabel}
                                    onChange={_onFileChange}
                                    custom
                                ></Form.File>
                            </Form>
                        </Col>
                    </Row>
                    <Row>
                        <Col>{dialogContent}</Col>
                    </Row>
                </Container>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={_onConfirm}>
                    {spinner}
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

/**
 * Renders an dropdown import button component that imports data from file.
 * When clicked, a dialog is opened where a user can select a file to import.
 *
 * @param onFileChange - function called when a file is selected. Do any processing or validation in response to this callback.
 * @param dialgoContent - Content of the dialog to be show. Can be a preview of the data or a validation message.
 * @param onConfirm - Called when the "Confirm" button is pressed. Can be an async function. If so, a spinner will be displayed between the time "Confirm" is pressed and the time `onConfirm` finishes executing.
 */
export function ImportButton({
    onFileChange,
    dialogContent,
    onConfirm,
    setInProgress,
}) {
    const [dialogOpen, setDialogOpen] = useState(false);

    /**
     * closes the dialog by setting dialogOpen to false
     */
    function handleClose() {
        setDialogOpen(false);
    }

    function onCancel() {
        onFileChange(null);
        handleClose();
    }

    async function _onConfirm(...args) {
        await onConfirm(...args);
        setDialogOpen(false);
    }

    return (
        <>
            <Button onClick={() => setDialogOpen(true)}>Import</Button>
            <ImportDialog
                dialogOpen={dialogOpen}
                onCancel={onCancel}
                onClose={handleClose}
                onFileChange={onFileChange}
                dialogContent={dialogContent}
                onConfirm={_onConfirm}
                setInProgress={setInProgress}
            />
        </>
    );
}

ImportButton.propTypes = {
    uploadFunc: PropTypes.func,
};

/**
 * Renders an dropdown import button component that imports data from file.
 * When clicked, a dialog is opened where a user can select a file to import.
 *
 * @param onFileChange - function called when a file is selected. Do any processing or validation in response to this callback.
 * @param dialgoContent - Content of the dialog to be show. Can be a preview of the data or a validation message.
 * @param onConfirm - Called when the "Confirm" button is pressed. Can be an async function. If so, a spinner will be displayed between the time "Confirm" is pressed and the time `onConfirm` finishes executing.
 */
export function ImportActionButton({
    onFileChange,
    dialogContent,
    onConfirm,
    setInProgress,
}) {
    const [dialogOpen, setDialogOpen] = useState(false);

    /**
     * closes the dialog by setting dialogOpen to false
     */
    function handleClose() {
        setDialogOpen(false);
    }

    function onCancel() {
        onFileChange(null);
        handleClose();
    }

    async function _onConfirm(...args) {
        await onConfirm(...args);
        setDialogOpen(false);
    }

    return (
        <>
            <ActionButton icon={FaUpload} onClick={() => setDialogOpen(true)}>
                Import
            </ActionButton>
            <ImportDialog
                dialogOpen={dialogOpen}
                onCancel={onCancel}
                onClose={handleClose}
                onFileChange={onFileChange}
                dialogContent={dialogContent}
                onConfirm={_onConfirm}
                setInProgress={setInProgress}
            />
        </>
    );
}

ImportButton.propTypes = {
    uploadFunc: PropTypes.func,
};
