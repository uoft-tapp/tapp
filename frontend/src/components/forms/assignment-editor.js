import React from "react";
import PropTypes from "prop-types";
import { Form } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";

import "react-bootstrap-typeahead/css/Typeahead.css";
import { docApiPropTypes } from "../../api/defs/doc-generation";
import { fieldEditorFactory, DialogRow } from "./common-controls";
import { splitDateRangeAtNewYear } from "../../api/mockAPI/utils";

/**
 * Adds up all the hours for the wage chunks belonging to an assignment and
 * returns true or false based on whether they match the number of hours for the
 * assignment.
 *
 * @param {*} assignment
 * @returns
 */
function assignmentAndWageChunksMatch(assignment) {
    if (!Array.isArray(assignment.wage_chunks)) {
        return true;
    }
    let totalHours = 0;
    for (const chunk of assignment.wage_chunks) {
        totalHours += chunk.hours;
    }
    return totalHours === assignment.hours;
}

const DEFAULT_ASSIGNMENT = {
    note: "",
    position: { id: null },
    position_id: null,
    applicant: { id: null },
    applicant_id: null,
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
        positions,
    } = props;
    const assignment = { ...DEFAULT_ASSIGNMENT, ...assignmentProp };

    React.useEffect(() => {
        // Create or destroy wage chunks based on whether an assignment's dates
        // cross the January 1 boundary.
        if (!assignment.start_date || !assignment.end_date) {
            // If there are no dates, unset any existing wage chunks and
            // return.
            if (assignment.wage_chunks) {
                setAssignment({ ...assignment, wage_chunks: null });
            }
            return;
        }
        const splitDateRanges = splitDateRangeAtNewYear(
            assignment.start_date,
            assignment.end_date
        );
        // splitDateRanges will have two ranges if we cross Jan 1 and one range otherwise.
        if (splitDateRanges.length === 1) {
            // With only one date range, we have no need for wage chunks.
            if (assignment.wage_chunks) {
                setAssignment({ ...assignment, wage_chunks: null });
            }
            return;
        }

        // If we made it here, we cross the January first boundary and have exactly two date ranges
        if (
            assignment.wage_chunks == null ||
            !assignmentAndWageChunksMatch(assignment)
        ) {
            const wage_chunks = splitDateRanges.map((range) => ({
                ...range,
                hours: assignment.hours / 2,
            }));
            setAssignment({ ...assignment, wage_chunks });
        }
    }, [assignment, setAssignment]);

    // update the selected position; this comes with side effects
    function setPosition(positions) {
        const position = positions[positions.length - 1] || { id: null };
        setAssignment({
            ...assignment,
            position,
            position_id: position.id,
            hours: position.hours_per_assignment,
            start_date: position.start_date,
            end_date: position.end_date,
        });
    }

    // update the selected applicant
    function setApplicant(applicants) {
        const applicant = applicants[applicants.length - 1] || { id: null };
        setAssignment({
            ...assignment,
            applicant,
            applicant_id: applicant.id,
        });
    }

    const createFieldEditor = fieldEditorFactory(assignment, setAssignment);

    let wageChunkAdjuster1 = null;
    let wageChunkAdjuster2 = null;
    if (assignment.wage_chunks != null) {
        // If there are any wage chunks, there are exactly two of them,
        // one for pre-January and one for post.
        const wageChunks = assignment.wage_chunks;
        wageChunkAdjuster1 = (
            <>
                <Form.Label>F Hours</Form.Label>
                <Form.Control
                    type="number"
                    title="The number of pre-January hours"
                    value={wageChunks[0].hours}
                    onChange={(e) => {
                        const newHours = Math.min(
                            Math.max(Number(e.target.value), 0),
                            assignment.hours
                        );
                        setAssignment({
                            ...assignment,
                            wage_chunks: [
                                { ...wageChunks[0], hours: newHours },
                                {
                                    ...wageChunks[1],
                                    hours: assignment.hours - newHours,
                                },
                            ],
                        });
                    }}
                />
            </>
        );
        wageChunkAdjuster2 = (
            <>
                <Form.Label>S Hours</Form.Label>
                <Form.Control
                    type="number"
                    title="The number of post-January hours. This value cannot be set directly. You must set the number of pre-January hours."
                    disabled
                    value={wageChunks[1].hours}
                />
            </>
        );
    }

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
                        labelKey={(option) =>
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
                        labelKey={(option) =>
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
                {createFieldEditor("Start Date", "start_date", "date")}
                {createFieldEditor("End Date", "end_date", "date")}
            </DialogRow>
            <DialogRow>
                {wageChunkAdjuster1}
                {wageChunkAdjuster2}
            </DialogRow>
        </Form>
    );
}
AssignmentEditor.propTypes = {
    assignment: docApiPropTypes.assignment.isRequired,
    setAssignment: PropTypes.func.isRequired,
    positions: PropTypes.arrayOf(docApiPropTypes.position),
    applicants: PropTypes.arrayOf(docApiPropTypes.applicant),
};
