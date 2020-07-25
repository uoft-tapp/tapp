import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { docApiPropTypes } from "../api/defs/doc-generation";
import { Form } from "react-bootstrap";
import { DialogRow } from "./forms/common-controls";
import { createDiffColumnsFromColumns } from "./diff-table";

const DEFAULT_COLUMNS = [
    { Header: "Last Name", accessor: "last_name" },
    { Header: "First Name", accessor: "first_name" },
    { Header: "Email", accessor: "email" },
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
    const pageSize = instructors?.length || 20;
    return (
        <React.Fragment>
            <ReactTable
                data={instructors}
                columns={columns}
                showPagination={false}
                defaultPageSize={pageSize}
                minRows={1}
            />
        </React.Fragment>
    );
}
InstructorsList.propTypes = {
    instructors: PropTypes.oneOfType([
        PropTypes.arrayOf(docApiPropTypes.instructor),
        PropTypes.any,
    ]).isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({ Header: PropTypes.any.isRequired })
    ),
};

export function InstructorsDiffList({ modifiedInstructors }) {
    return (
        <InstructorsList
            instructors={modifiedInstructors}
            columns={createDiffColumnsFromColumns(DEFAULT_COLUMNS)}
        />
    );
}

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
                <DialogRow>
                    {createFieldEditor("First Name", "first_name")}
                    {createFieldEditor("Last Name", "last_name")}
                </DialogRow>
                <DialogRow>
                    {createFieldEditor("Email", "email")}
                    {createFieldEditor("UTORid", "utorid")}
                </DialogRow>
            </Form.Row>
        </Form>
    );
}
InstructorEditor.propTypes = {
    instructor: docApiPropTypes.instructor,
    setInstructor: PropTypes.func,
};
