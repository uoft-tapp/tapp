import React from "react";
import { useSelector } from "react-redux";
import FileSaver from "file-saver";
import { FaDownload } from "react-icons/fa";
import {
    contractTemplatesSelector,
    previewContractTemplate,
    downloadContractTemplate,
} from "../../../api/actions";
import { ContractTemplatesList } from "../../../components/contract-templates-list";
import { FaSearch } from "react-icons/fa";
import { Button, Modal, Alert, Spinner } from "react-bootstrap";
import ModalHeader from "react-bootstrap/ModalHeader";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { CellProps } from "react-table";
import { ContractTemplate } from "../../../api/defs/types";

function TemplatePreviewDialog({
    show,
    onClose,
    template_id,
}: {
    show: boolean;
    onClose: (...args: any[]) => void;
    template_id: number | null;
}) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [cachedPreview, setCachedPreview] = React.useState<{
        id: number | null;
        content: string | null;
    }>({
        id: null,
        content: null,
    });
    const dispatch = useThunkDispatch();

    React.useEffect(() => {
        if (
            // Don't try to load an invalid template
            template_id == null ||
            // Don't reload a template that we've already loaded
            template_id === cachedPreview.id
        ) {
            setIsLoading(false);
            return;
        }

        // We're loading a template that we haven't loaded yet.
        setIsLoading(true);
        dispatch(previewContractTemplate(template_id))
            .then((content) => {
                setCachedPreview({ id: template_id, content });
            })
            .finally(() => setIsLoading(false));
    }, [template_id, setIsLoading, cachedPreview.id, dispatch]);

    async function downloadClicked() {
        if (template_id == null) {
            return;
        }
        const file = await dispatch(downloadContractTemplate(template_id));
        FileSaver.saveAs(file);
    }

    return (
        <Modal
            size="xl"
            show={show}
            onHide={onClose}
            dialogClassName="fullscreen-modal"
        >
            <ModalHeader closeButton>
                <Modal.Title>Previewing Template</Modal.Title>
            </ModalHeader>
            <Modal.Body className="d-flex">
                <p>
                    The template you are previewing has its fields filled in
                    with dummy values. These values will be replaced with
                    correct values when the template is used to create a
                    contract.
                </p>
                {isLoading && (
                    <Alert variant="info">
                        <Spinner animation="border" className="mr-3" />
                        Loading Template...
                    </Alert>
                )}
                {template_id != null && !isLoading && (
                    <iframe
                        style={{
                            border: "1px solid black",
                            width: "100%",
                            flexGrow: 1,
                        }}
                        srcDoc={
                            isLoading
                                ? undefined
                                : cachedPreview.content || undefined
                        }
                        title="Contract template preview"
                    />
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    title="Download a copy of this template. The downloaded copy will have no substitutions made and will be suitable for editing."
                    onClick={downloadClicked}
                    variant="link"
                >
                    <FaDownload className="mr-2" />
                    Download Template
                </Button>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export function ConnectedContractTemplateList() {
    const [previewVisible, setPreviewVisible] = React.useState(false);
    const [previewingTemplate, setPreviewingTemplate] = React.useState<
        number | null
    >(null);
    const contractTemplates = useSelector(contractTemplatesSelector);
    const columns = [
        { Header: "Template Name", accessor: "template_name", width: 200 },
        {
            Header: "Template File",
            accessor: "template_file",
            Cell: TemplateFileCell,
            width: 400,
        },
    ];

    function TemplateFileCell({ row }: CellProps<ContractTemplate>) {
        const rowData = row.original;
        const template_id = rowData.id;
        const template_file = rowData.template_file;

        return (
            <div>
                <Button
                    variant="light"
                    size="sm"
                    className="mr-2 py-0"
                    title="Preview Template"
                    onClick={() => previewClicked(template_id)}
                >
                    <FaSearch />
                </Button>
                {template_file}
            </div>
        );
    }

    function previewClicked(template_id: number) {
        setPreviewingTemplate(template_id);
        setPreviewVisible(true);
    }

    return (
        <>
            <ContractTemplatesList
                contractTemplates={contractTemplates}
                columns={columns}
            />
            <TemplatePreviewDialog
                show={previewVisible}
                onClose={() => setPreviewVisible(false)}
                template_id={previewingTemplate}
            />
        </>
    );
}
