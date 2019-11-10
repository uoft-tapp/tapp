import React from "react";
import PropTypes from "prop-types";
import { Form } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";

import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead-bs4.css";
import { docApiPropTypes } from "../../api/defs/doc-generation";
import { fieldEditorFactory, DialogRow } from "./common-controls";

const DEFAULT_POSITION = {
    position_code: "",
    position_title: "",
    hours_per_assignment: 0,
    contract_template: {},
    duties:
        "Some combination of marking, invigilating, tutorials, office hours, and the help centre.",
    instructors: []
};

/**
 * Edit information about a position
 *
 * @export
 * @param {{position: object, instructors: object[]}} props
 * @returns
 */
export function PositionEditor(props) {
    const {
        position: positionProp,
        setPosition,
        instructors = [],
        contractTemplates = [],
        defaultContractTemplate = {}
    } = props;
    const position = { ...DEFAULT_POSITION, ...positionProp };

    /**
     * Set `position.instructors` to the specified list.
     *
     * @param {*} instructors
     */
    function setInstructors(instructors) {
        setPosition({ ...position, instructors });
    }

    /**
     * Set `position.contract_template` to the most recently selected item
     *
     * @param {*} selectedContractTypes
     */
    function setContractType(selectedContractTypes) {
        const contract_template =
            selectedContractTypes[selectedContractTypes.length - 1] ||
            defaultContractTemplate;
        setPosition({ ...position, contract_template });
    }

    const createFieldEditor = fieldEditorFactory(position, setPosition);

    return (
        <Form>
            <DialogRow>
                {createFieldEditor(
                    "Course Code (e.g. MAT135H1F)",
                    "position_code"
                )}
                {createFieldEditor("Course Title", "position_title")}
            </DialogRow>
            <DialogRow>
                {createFieldEditor("Start Date", "start_date", "date")}
                {createFieldEditor("End Date", "end_date", "date")}
                {createFieldEditor(
                    "Hours per Assignment",
                    "hours_per_assignment",
                    "number"
                )}
            </DialogRow>
            <Form.Group>
                <Form.Label>Instructors</Form.Label>
                <Typeahead
                    id="instructors-input"
                    ignoreDiacritics={true}
                    multiple
                    placeholder="Instructors..."
                    labelKey={option =>
                        `${option.first_name} ${option.last_name}`
                    }
                    selected={position.instructors}
                    options={instructors}
                    onChange={setInstructors}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>
                    Contract Template (which offer template will be used)
                </Form.Label>
                <Typeahead
                    id="instructors-input"
                    ignoreDiacritics={true}
                    multiple
                    placeholder="Contract template..."
                    labelKey={option => `${option.template_name}`}
                    selected={[position.contract_template]}
                    options={contractTemplates}
                    onChange={setContractType}
                />
            </Form.Group>
            <h3>Ad-related Info</h3>
            <DialogRow>{createFieldEditor("Duties", "duties")}</DialogRow>
            <DialogRow>
                {createFieldEditor("Qualifications", "qualifications")}
            </DialogRow>
            <h3>Admin Info</h3>
            <DialogRow>
                {createFieldEditor(
                    "Current Enrollment",
                    "current_enrollment",
                    "number"
                )}
                {createFieldEditor(
                    "Waitlisted",
                    "current_waitlisted",
                    "number"
                )}
                {createFieldEditor(
                    "Desired Number of Assignments",
                    "desired_num_assignments",
                    "number"
                )}
            </DialogRow>
        </Form>
    );
}
PositionEditor.propTypes = {
    position: docApiPropTypes.position.isRequired,
    setPosition: PropTypes.func.isRequired,
    instructors: PropTypes.arrayOf(docApiPropTypes.instructor),
    defaultContractTemplate: docApiPropTypes.contractTemplate,
    contractTemplates: PropTypes.arrayOf(docApiPropTypes.contractTemplate)
};
