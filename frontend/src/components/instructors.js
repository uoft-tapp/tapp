import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { docApiPropTypes } from "../api/defs/doc-generation";
import { Col, Form } from "react-bootstrap";

const DEFAULT_COLUMNS = [
    { Header: "Last Name", accessor: "last_name" },
    { Header: "First Name", accessor: "first_name" },
    { Header: "UTORid", accessor: "utorid" },
];

/**
 * List the instructors using a ReactTable. `columns` can be passed
 * in to customize columns/cell renderers.
 *
 * @export
 * @param {{instructors: object[], columns: object[]}} props
 * @returns
 */
export function InstructorsList(props) {
    const { instructors, columns = DEFAULT_COLUMNS } = props;
    return (
        <React.Fragment>
            <h3>Instructors</h3>
            <ReactTable
                data={instructors}
                columns={columns}
                showPagination={false}
                minRows={1}
            />
        </React.Fragment>
    );
}
InstructorsList.propTypes = {
    instructors: PropTypes.arrayOf(docApiPropTypes.instructor).isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({ Header: PropTypes.any.isRequired })
    ),
};

const DEFAULT_INSTRUCTOR = {
    utorid: "",
    last_name: "",
    first_name: "",
};

/**
 * Edit information about an instructor.
 *
 * @export
 * @param {{instructor: object, setInstructor: function}} props
 * @returns
 */
export function InstructorEditor(props) {
    const { instructor: instructorProps, setInstructor } = props;
    const instructor = { ...DEFAULT_INSTRUCTOR, ...instructorProps };

    /**
     * Create a callback function which updates the specified attribute
     * of a position.
     *
     * @param {string} attr
     * @returns
     */
    function setAttrFactory(attr) {
        return (e) => {
            const newVal = e.target.value || "";
            const newInstructor = { ...instructor, [attr]: newVal };
            setInstructor(newInstructor);
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
                    value={instructor[attr] || ""}
                    onChange={setAttrFactory(attr)}
                />
            </React.Fragment>
        );
    }

    return (
        <Form>
            <Form.Row>
                <Form.Group as={Col}>
                    {createFieldEditor("First Name", "first_name")}
                </Form.Group>
                <Form.Group as={Col}>
                    {createFieldEditor("Last Name", "last_name")}
                </Form.Group>
                <Form.Group as={Col}>
                    {createFieldEditor("UTORid", "utorid")}
                </Form.Group>
            </Form.Row>
        </Form>
    );
}
InstructorEditor.propTypes = {
    instructor: docApiPropTypes.instructor,
    setInstructor: PropTypes.func,
};
