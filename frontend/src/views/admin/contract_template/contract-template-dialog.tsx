import React from "react";
import { useSelector } from "react-redux";
import { Modal, Button, Alert } from "react-bootstrap";
import {
    contractTemplatesSelector,
    allContractTemplatesSelector,
    upsertContractTemplate,
    fetchAllContractTemplates,
} from "../../../api/actions";
import { strip } from "../../../libs/utils";
import { ContractTemplateEditor } from "../../../components/forms/contract-template-editor";
import { ContractTemplate, PropsForElement } from "../../../api/defs/types";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

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
function getConflicts(
    contractTemplate: Partial<ContractTemplate>,
    contractTemplates: ContractTemplate[]
) {
    const ret: { delayShow: string; immediateShow: React.ReactNode } = {
        delayShow: "",
        immediateShow: "",
    };
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

function AddContractTemplateDialog(props: {
    show: boolean;
    onHide: (...args: any[]) => void;
    contractTemplates: ContractTemplate[];
    upsertContractTemplate: (template: Partial<ContractTemplate>) => any;
    fetchAllContractTemplates: (...args: any[]) => any;
    availableTemplates: { template_file: string }[];
}) {
    const {
        show,
        onHide = () => {},
        contractTemplates,
        availableTemplates,
        upsertContractTemplate,
        fetchAllContractTemplates,
    } = props;
    const [newContractTemplate, setNewContractTemplate] = React.useState<
        Partial<ContractTemplate>
    >(BLANK_CONTRACT_TEMPLATE);

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
export function ConnectedAddContractTemplateDialog(
    props: Pick<
        PropsForElement<typeof AddContractTemplateDialog>,
        "show" | "onHide"
    >
) {
    const contractTemplates = useSelector(contractTemplatesSelector);
    const availableTemplates = useSelector(allContractTemplatesSelector);
    const dispatch = useThunkDispatch();
    const _upsertContractTemplate = React.useCallback(
        (template) => dispatch(upsertContractTemplate(template)),
        [dispatch]
    );
    const _fetchAllContractTemplates = React.useCallback(
        () => dispatch(fetchAllContractTemplates()),
        [dispatch]
    );
    return (
        <AddContractTemplateDialog
            contractTemplates={contractTemplates}
            availableTemplates={availableTemplates}
            upsertContractTemplate={_upsertContractTemplate}
            fetchAllContractTemplates={_fetchAllContractTemplates}
            {...props}
        />
    );
}
