import React from "react";
import { ActionButton } from "../../components/action-buttons";
import { FaUpload } from "react-icons/fa";
import { uploadContractTemplate } from "../../api/actions";
import {
    Modal,
    Row,
    Col,
    Container,
    Form,
    Button,
    Spinner,
} from "react-bootstrap";
import { useThunkDispatch } from "../../libs/thunk-dispatch";

export function ConnectedUploadContractTemplateAction({ disabled = false }) {
    const dispatch = useThunkDispatch();
    const [file, setFile] = React.useState<File | null>(null);
    const [fileInputLabel, setFileInputLabel] = React.useState(
        "Select an HTML template file."
    );
    const [dialogOpen, setDialogOpen] = React.useState<Boolean>(false);
    const [inProgress, setInProgress] = React.useState(false);

    async function _onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event?.target?.files) {
            const file = event.target.files[0];
            setFile(file);
            setFileInputLabel(file.name);
        } else {
            setFile(null);
        }
    }

    async function onConfirm() {
        if (file) {
            setInProgress(true);
            try {
                await dispatch(uploadContractTemplate(file));
            } finally {
                setInProgress(false);
            }
        }

        onCancel();
    }
    function onCancel() {
        setDialogOpen(false);
        setFileInputLabel("Select an HTML template file.");
        setFile(null);
    }

    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="mr-1" />
    ) : null;

    return (
        <>
            <ActionButton
                icon={FaUpload}
                onClick={() => setDialogOpen(true)}
                disabled={disabled}
            >
                Upload Contract Template
            </ActionButton>
            <Modal
                show={dialogOpen}
                onHide={onCancel}
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
                            <Col>
                                <p>
                                    A template is an HTML file with special
                                    substitution strings (words surrounded by{" "}
                                    {"{{"} and {"}}"}) that will be replaced
                                    with assignment-specific values when
                                    rendered as a contract.
                                </p>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        disabled={!file}
                        title={
                            file
                                ? `Upload '${fileInputLabel}' to TAPP`
                                : "You must select a file to upload."
                        }
                        onClick={onConfirm}
                    >
                        {spinner}
                        <FaUpload className="mr-2" />
                        Upload
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
