import React from "react";
import PropTypes from "prop-types";
import { Form } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";

import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead-bs4.css";
import { docApiPropTypes } from "../../api/defs/doc-generation";
import { fieldEditorFactory, DialogRow } from "./common-controls";

const DEFAULT_ASSIGNMENT = {
    note: "",
    position: { id: null },
    position_id: null,
    applicant: { id: null },
    applicant_id: null
};

/**
 * Edit information about a position
 *
 * @export
 * @param {{position: object, instructors: object[]}} props
 * @returns
 */
export function AssignmentEditor(props) {
    const {
        assignment: assignmentProp,
        setAssignment,
        applicants,
        positions
    } = props;
    const assignment = { ...DEFAULT_ASSIGNMENT, ...assignmentProp };

    // update the selected position; this comes with side effects
    function setPosition(positions) {
        const position = positions[positions.length - 1] || { id: null };
        setAssignment({
            ...assignment,
            position,
            position_id: position.id,
            hours: position.hours_per_assignment,
            contract_start: position.start_date,
            contract_end: position.end_date
        });
    }

    // update the selected applicant
    function setApplicant(applicants) {
        const applicant = applicants[applicants.length - 1] || { id: null };
        setAssignment({
            ...assignment,
            applicant,
            applicant_id: applicant.id
        });
    }

    const createFieldEditor = fieldEditorFactory(assignment, setAssignment);

    return (
        <Form>
            <DialogRow>
                <React.Fragment>
                    <Form.Label>Position</Form.Label>
                    <Typeahead
                        id="position-input"
                        ignoreDiacritics={true}
                        placeholder="Position..."
                        multiple
                        labelKey={option =>
                            `${option.position_code} (${option.position_title})`
                        }
                        selected={
                            assignment.position.id == null
                                ? []
                                : [assignment.position]
                        }
                        options={positions}
                        onChange={setPosition}
                    />
                </React.Fragment>
                <React.Fragment>
                    <Form.Label>Applicant</Form.Label>
                    <Typeahead
                        id="applicant-input"
                        ignoreDiacritics={true}
                        placeholder="Applicant..."
                        multiple
                        labelKey={option =>
                            `${option.first_name} ${option.last_name}`
                        }
                        selected={
                            assignment.applicant.id == null
                                ? []
                                : [assignment.applicant]
                        }
                        options={applicants}
                        onChange={setApplicant}
                    />
                </React.Fragment>
            </DialogRow>
            <DialogRow>
                {createFieldEditor("Hours", "hours", "number")}
            </DialogRow>

            <h4>Optional Settings</h4>
            <DialogRow>
                {createFieldEditor("Start Date", "contract_start", "date")}
                {createFieldEditor("End Date", "contract_end", "date")}
            </DialogRow>
        </Form>
    );
}
AssignmentEditor.propTypes = {
    assignment: docApiPropTypes.assignment.isRequired,
    setAssignment: PropTypes.func.isRequired,
    positions: PropTypes.arrayOf(docApiPropTypes.position),
    applicants: PropTypes.arrayOf(docApiPropTypes.applicant)
};
