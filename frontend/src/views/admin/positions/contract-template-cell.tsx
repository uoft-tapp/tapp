import React from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import { useSelector } from "react-redux";
import {
    contractTemplatesSelector,
    upsertPosition,
} from "../../../api/actions";
import { ContractTemplate, Position } from "../../../api/defs/types";
import { EditFieldIcon } from "../../../components/edit-field-widgets";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

/**
 * Turn a list of ContractTemplate objects into a hash string for comparison as to whether
 * an instructor list has changed.
 *
 * @param {*} contractTemplates
 * @returns
 */
function hashContractTemplateList(contractTemplates: ContractTemplate[]) {
    return contractTemplates
        .map((i) => `${i.template_file}, ${i.template_name}`)
        .sort()
        .join(";");
}

/**
 * A dialog allowing one to edit a contract template. `onChange` is called
 * when "save" is clicked while editing this value.
 *
 * @param {*} props
 * @returns
 */
function EditContractTemplateDialog({
    position,
    show,
    onHide,
    onChange,
}: {
    position: Position;
    show: boolean;
    onHide: Function;
    onChange: Function;
}) {
    const value = [position.contract_template];
    const allContractTemplates = useSelector(contractTemplatesSelector);
    const [fieldVal, setFieldVal] = React.useState(value);
    const [inProgress, setInProgress] = React.useState(false);

    function cancelClick() {
        setFieldVal(value);
        onHide();
    }

    function saveClick() {
        async function doSave() {
            if (
                hashContractTemplateList(fieldVal) !==
                hashContractTemplateList(value)
            ) {
                setInProgress(true);
                // Only call `onChange` if the value has changed
                await onChange(fieldVal, value);
            }
        }
        doSave().finally(() => {
            setInProgress(false);
        });
    }
    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="mr-1" />
    ) : null;

    const changeIndicator =
        // eslint-disable-next-line
        hashContractTemplateList(fieldVal) ==
        hashContractTemplateList(value) ? null : (
            <span>
                Change from{" "}
                <span className="field-dialog-formatted-name">
                    {value
                        .map(
                            (contractTemplate) =>
                                `${contractTemplate.template_name}`
                        )
                        .join(", ")}
                </span>{" "}
                to{" "}
                <span className="field-dialog-formatted-name">
                    {fieldVal
                        .map(
                            (contractTemplate) =>
                                `${contractTemplate.template_name}`
                        )
                        .join(", ")}
                </span>
            </span>
        );

    return (
        <Modal show={show} onHide={cancelClick}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Edit Contract Template for {position.position_code}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Typeahead
                    id="instructors-input"
                    ignoreDiacritics={true}
                    multiple
                    placeholder="Contract Template..."
                    labelKey={(option) => `${option.template_name}`}
                    selected={fieldVal}
                    options={allContractTemplates}
                    onChange={(val) =>
                        setFieldVal([
                            val[val.length - 1] || position.contract_template,
                        ])
                    }
                />{" "}
                {changeIndicator}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={cancelClick} variant="outline-secondary">
                    Cancel
                </Button>
                <Button onClick={saveClick}>{spinner}Save</Button>
            </Modal.Footer>
        </Modal>
    );
}
export function EditContractTemplateCell({
    row,
}: {
    row: { original: Position };
}) {
    const position = row.original;
    const [dialogShow, setDialogShow] = React.useState(false);
    const dispatch = useThunkDispatch();

    return (
        <div className="show-on-hover-wrapper">
            {position.contract_template.template_name}
            <EditFieldIcon
                title="Edit the contract templates for this position"
                hidden={false}
                onClick={() => setDialogShow(true)}
            />
            <EditContractTemplateDialog
                position={position}
                show={dialogShow}
                onHide={() => setDialogShow(false)}
                onChange={async (newContractTemplate: ContractTemplate[]) => {
                    // A position must have a ContractTemplate. Bail if we're trying to "unset" one.
                    if (newContractTemplate.length === 0) {
                        return;
                    }
                    await dispatch(
                        upsertPosition({
                            id: position.id,
                            contract_template:
                                newContractTemplate[
                                    newContractTemplate.length - 1
                                ] || position.contract_template,
                        })
                    );
                    setDialogShow(false);
                }}
            />
        </div>
    );
}
