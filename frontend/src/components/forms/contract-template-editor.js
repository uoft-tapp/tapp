import React from "react";
import PropTypes from "prop-types";
import { Form } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";

import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead-bs4.css";
import { docApiPropTypes } from "../../api/defs/doc-generation";
import { fieldEditorFactory, DialogRow } from "./common-controls";

const DEFAULT_CONTRACT_TEMPLATE = {
    template_name: "",
    template_file: ""
};

/**
 * Edit information about a contract_template
 *
 * @export
 * @param {{contractTemplate: object, availableTemplates: object[], setContractTemplate: function}} props
 * @returns
 */
export function ContractTemplateEditor(props) {
    const {
        contractTemplate: contractTemplateProp,
        setContractTemplate,
        availableTemplates = []
    } = props;
    const contractTemplate = {
        ...DEFAULT_CONTRACT_TEMPLATE,
        ...contractTemplateProp
    };

    // update the selected template_file; this comes with side effects
    function setTemplateFile(templates) {
        const templateFile = templates[templates.length - 1] || "";
        setContractTemplate({
            ...contractTemplate,
            template_file: templateFile
        });
    }

    const createFieldEditor = fieldEditorFactory(
        contractTemplate,
        setContractTemplate
    );

    return (
        <Form>
            <DialogRow>
                {createFieldEditor(
                    'Template Name (e.g. "OTO" "Invigilate")',
                    "template_name"
                )}
            </DialogRow>
            <DialogRow>
                <React.Fragment>
                    <Form.Label title="This file is stored on the server; you can edit it there.">
                        Template File
                    </Form.Label>
                    <Typeahead
                        id="file-name-input"
                        ignoreDiacritics={true}
                        placeholder="File name..."
                        multiple
                        labelKey={option => `${option}`}
                        selected={
                            !contractTemplate.template_file
                                ? []
                                : [contractTemplate.template_file]
                        }
                        options={availableTemplates.map(x => x.template_file)}
                        onChange={setTemplateFile}
                    />
                </React.Fragment>
            </DialogRow>
        </Form>
    );
}
ContractTemplateEditor.propTypes = {
    contractTemplate: docApiPropTypes.contractTemplate.isRequired,
    setContractTemplate: PropTypes.func.isRequired,
    availableTemplates: PropTypes.arrayOf(
        docApiPropTypes.contractTemplateMinimal
    )
};
