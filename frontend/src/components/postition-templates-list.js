import React from "react";
import PropTypes from "prop-types";

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
                <ul>
                    {position_templates.map(template => (
                        <li key={template.offer_template}>
                            <font size="3" color="blue">
                                {" "}
                                {template.position_type}
                            </font>
                            , {template.offer_template}
                        </li>
                    ))}
                </ul>
            );
        }
        return (
            <div>
                <h3>Available Templates</h3>
                {templateList}
            </div>
        );
    }
}
