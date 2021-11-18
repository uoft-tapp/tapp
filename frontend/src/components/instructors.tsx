import React from "react";
import PropTypes from "prop-types";
import { docApiPropTypes } from "../api/defs/doc-generation";
import { Form } from "react-bootstrap";
import { DialogRow, fieldEditorFactory } from "./forms/common-controls";
import { createDiffColumnsFromColumns } from "./diff-table";
import { AdvancedFilterTable } from "./filter-table/advanced-filter-table";
import { Instructor, MinimalInstructor } from "../api/defs/types";
import { DiffSpec } from "../libs/diffs";

const DEFAULT_COLUMNS = [
    { Header: "Last Name", accessor: "last_name" },
    { Header: "First Name", accessor: "first_name" },
    { Header: "Email", accessor: "email", minWidth: 120 },
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
export function InstructorsList(props: {
    instructors: Omit<Instructor, "id">[];
    columns?: any[];
}) {
    const { instructors, columns = DEFAULT_COLUMNS } = props;
    return (
        <AdvancedFilterTable
            data={instructors}
            columns={columns}
            filterable={true}
        />
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

export function InstructorsDiffList({
    modifiedInstructors,
}: {
    modifiedInstructors: DiffSpec<MinimalInstructor, Instructor>[];
}) {
    return (
        <InstructorsList
            instructors={modifiedInstructors as any[]}
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
export function InstructorEditor(props: {
    instructor: Partial<Instructor>;
    setInstructor: (instructor: Instructor) => any;
}) {
    const { instructor: instructorProps, setInstructor } = props;
    const instructor = { ...DEFAULT_INSTRUCTOR, ...instructorProps };

    const createFieldEditor = fieldEditorFactory<Instructor>(
        instructor as Instructor,
        setInstructor
    );

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
