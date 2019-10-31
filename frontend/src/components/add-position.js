import React from "react";
import PropTypes from "prop-types";
import { Form, Col } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";

import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead-bs4.css";
import { docApiPropTypes } from "../api/defs/doc-generation";

const DEFAULT_POSITION = {
    position_code: "",
    position_title: "",
    est_hours_per_assignment: 0,
    position_type: "standard",
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
    const { position: positionProp, setPosition, instructors = [] } = props;
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
     * Create a callback function which updates the specified attribute
     * of a position.
     *
     * @param {string} attr
     * @returns
     */
    function setAttrFactory(attr) {
        return e => {
            const newVal = e.target.value || "";
            const newPosition = { ...position, [attr]: newVal };
            setPosition(newPosition);
        };
    }

    /**
     * Create a bootstrap form component that updates the specified attr
     * of `position`
     *
     * @param {string} title - Label text of the form control
     * @param {string} attr - attribute of `position` to be updated when this form control changes
     * @returns {node}
     */
    function createFieldEditor(title, attr, type = "text") {
        return (
            <React.Fragment>
                <Form.Label>{title}</Form.Label>
                <Form.Control
                    type={type}
                    value={position[attr] || ""}
                    onChange={setAttrFactory(attr)}
                />
            </React.Fragment>
        );
    }

    return (
        <Form>
            <Form.Row>
                <Form.Group as={Col}>
                    {createFieldEditor(
                        "Course (e.g. MAT135H1F)",
                        "position_code"
                    )}
                </Form.Group>
                <Form.Group as={Col}>
                    {createFieldEditor("Course Title", "position_title")}
                </Form.Group>
            </Form.Row>
            <Form.Row>
                <Form.Group as={Col}>
                    {createFieldEditor("Start Date", "est_start_date", "date")}
                </Form.Group>
                <Form.Group as={Col}>
                    {createFieldEditor("End Date", "est_end_date", "date")}
                </Form.Group>
                <Form.Group as={Col}>
                    {createFieldEditor(
                        "Hours per Assignment",
                        "est_hours_per_assignment",
                        "number"
                    )}
                </Form.Group>
            </Form.Row>
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

            <h3>Ad-related Info</h3>
            <Form.Group>
                {createFieldEditor("Duties", "duties")}
                {createFieldEditor("Qualifications", "qualifications")}
            </Form.Group>

            <h3>Admin Info</h3>
            <Form.Row>
                <Form.Group as={Col}>
                    {createFieldEditor(
                        "Current Enrollment",
                        "current_enrollment",
                        "number"
                    )}
                </Form.Group>
                <Form.Group as={Col}>
                    {createFieldEditor(
                        "Waitlisted",
                        "current_waitlisted",
                        "number"
                    )}
                </Form.Group>
                <Form.Group as={Col}>
                    {createFieldEditor(
                        "Desired Number of Assignments",
                        "desired_num_assignments",
                        "number"
                    )}
                </Form.Group>
            </Form.Row>
        </Form>
    );
}
PositionEditor.propTypes = {
    position: docApiPropTypes.position,
    instructors: PropTypes.arrayOf(docApiPropTypes.instructor)
};
