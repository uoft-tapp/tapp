import React from "react";
import { connect } from "react-redux";
import { Modal, Button, Alert } from "react-bootstrap";
import {
    contractTemplatesSelector,
    allContractTemplatesSelector,
    upsertContractTemplate,
    fetchAllContractTemplates,
} from "../../api/actions";
import { strip } from "../../libs/utils";
import { ContractTemplateEditor } from "../../components/forms/contract-template-editor";

const BLANK_CONTRACT_TEMPLATE = {
    template_name: "",
    template_file: "",
};

/**
 * Find if there is a conflicting instructor in the passed in list
 * of instructors, or if any required fields are incorrect.
 *
 * @param {object} contractTemplate
 * @param {object[]} contractTemplates
 */
function getConflicts(contractTemplate, contractTemplates) {
    const ret = { delayShow: "", immediateShow: "" };
    if (
        !strip(contractTemplate.template_name) ||
        !strip(contractTemplate.template_file)
    ) {
        ret.delayShow = "A template name and template file is required";
    }
    const matchingTemplate = contractTemplates.find(
        (x) => strip(x.template_name) === strip(contractTemplate.template_name)
    );
    if (matchingTemplate) {
        ret.immediateShow = (
            <p>
                Another contract template exists with name=
                {contractTemplate.template_name}:{" "}
                <b>
                    {matchingTemplate.template_name}{" "}
                    {matchingTemplate.template_file}
                </b>
            </p>
        );
    }
    return ret;
}

function AddContractTemplateDialog(props) {
    const {
        show,
        onHide = () => {},
        contractTemplates,
        availableTemplates,
        upsertContractTemplate,
        fetchAllContractTemplates,
    } = props;
    const [newContractTemplate, setNewContractTemplate] = React.useState(
        BLANK_CONTRACT_TEMPLATE
    );

    React.useEffect(() => {
        if (!show) {
            // If the dialog is hidden, reset the state
            setNewContractTemplate(BLANK_CONTRACT_TEMPLATE);
        } else {
            // If we've just become visible, fetch all available contract templates
            fetchAllContractTemplates();
        }
    }, [show, fetchAllContractTemplates]);

    function createContractTemplate() {
        upsertContractTemplate(newContractTemplate);
        onHide();
    }

    const conflicts = getConflicts(newContractTemplate, contractTemplates);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add Contract Template</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ContractTemplateEditor
                    contractTemplate={newContractTemplate}
                    setContractTemplate={setNewContractTemplate}
                    availableTemplates={availableTemplates}
                />

                {conflicts.immediateShow ? (
                    <Alert variant="danger">{conflicts.immediateShow}</Alert>
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button
                    onClick={createContractTemplate}
                    title={conflicts.delayShow || "Create Contract Template"}
                    disabled={
                        !!conflicts.delayShow || !!conflicts.immediateShow
                    }
                >
                    Create Contract Template
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
/**
 * AddContractTemplateDialog that has been connected to the redux store
 */
export const ConnectedAddContractTemplateDialog = connect(
    (state) => ({
        contractTemplates: contractTemplatesSelector(state),
        availableTemplates: allContractTemplatesSelector(state),
    }),
    { upsertContractTemplate, fetchAllContractTemplates }
)(AddContractTemplateDialog);
