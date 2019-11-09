import React from "react";
import PropTypes from "prop-types";
import "./components.css";
import { docApiPropTypes } from "../api/defs/doc-generation";

export class ContractTemplatesList extends React.Component {
    static propTypes = {
        contract_templates: PropTypes.arrayOf(
            docApiPropTypes.contractTemplate
        ).isRequired
    };
    render() {
        const { contract_templates } = this.props;
        let templateList = <div>No Templates...</div>;
        if (contract_templates.length > 0) {
            templateList = (
                <ul>
                    {contract_templates.map(template => (
                        <li key={template.template_name}>
                            <span className="position-type">
                                {template.template_name}
                            </span>
                            , {template.template_file}
                        </li>
                    ))}
                </ul>
            );
        }
        return (
            <div className="template-list">
                <h3>Available Templates</h3>
                {templateList}
            </div>
        );
    }
}
