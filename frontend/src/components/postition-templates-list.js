import React from "react";
import PropTypes from "prop-types";
import "./components.css";

export class PositionTemplatesList extends React.Component {
    static propTypes = {
        position_templates: PropTypes.arrayOf(
            PropTypes.shape({
                position_type: PropTypes.string,
                offer_template: PropTypes.string
            })
        ).isRequired
    };
    render() {
        const { position_templates } = this.props;
        let templateList = <div>No Templates...</div>;
        if (position_templates.length > 0) {
            templateList = (
                <div>
                    <ul>
                        {position_templates.map(template => (
                            <li key={template.offer_template}>
                                <span className="position-type">
                                    {template.position_type}
                                </span>
                                , {template.offer_template}
                            </li>
                        ))}
                    </ul>
                </div>
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
