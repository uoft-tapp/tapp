import React from "react";
import { connect } from "react-redux";
import { Button } from "react-bootstrap";
import {
    instructorsSelector,
    upsertInstructor,
    deleteInstructor,
} from "../../api/actions";
import { InstructorsList } from "../../components/instructors";
import { EditableField } from "../../components/edit-field-widgets";

/**
 * A cell that renders a button for deleting the instructor from that row.
 *
 * @param {*} props
 * @returns a button which when clicked deletes the instructor.
 */
function DeleteButtonCell(props) {
    const {
        deleteInstructor,
        original: { id: applicantId },
    } = props;
    function onClick() {
        deleteInstructor({ id: applicantId });
    }
    return (
        <Button variant="outline-danger" onClick={onClick}>
            Delete
        </Button>
    );
}
/**
 * A cell that renders editable applicant information
 *
 * @param {*} props
 * @returns
 */
function EditableCell(props) {
    const title = `Edit ${props.column.Header}`;
    const { upsertInstructor, field } = props;
    function onChange(newVal) {
        const applicantId = props.original.id;
        upsertInstructor({ id: applicantId, [field]: newVal });
    }
    return (
        <EditableField
            title={title}
            value={props.value || ""}
            onChange={onChange}
        >
            {props.value}
        </EditableField>
    );
}

function EditableInstructorsList(props) {
    const { upsertInstructor, deleteInstructor, ...rest } = props;

    // Bind an `ApplicantCell` to a particular field
    function generateCell(field) {
        return (props) => (
            <EditableCell
                field={field}
                upsertInstructor={upsertInstructor}
                {...props}
            />
        );
    }

    function generateDeleteCell() {
        return (props) => (
            <DeleteButtonCell deleteInstructor={deleteInstructor} {...props} />
        );
    }

    const columns = [
        {
            Header: "Last Name",
            accessor: "last_name",
            Cell: generateCell("last_name"),
        },
        {
            Header: "First Name",
            accessor: "first_name",
            Cell: generateCell("first_name"),
        },
        {
            Header: "Email",
            accessor: "email",
            Cell: generateCell("email"),
        },
        {
            Header: "UTORid",
            accessor: "utorid",
            Cell: generateCell("utorid"),
        },
        {
            Header: "Delete",
            Cell: generateDeleteCell(),
        },
    ];

    return <InstructorsList columns={columns} {...rest} />;
}

/**
 * EditableInstructorsList that has been connected to the redux store
 * for live updates and editability.
 */
export const ConnectedInstructorsList = connect(
    (state) => ({
        instructors: instructorsSelector(state),
    }),
    { upsertInstructor, deleteInstructor }
)(EditableInstructorsList);
