import React from "react";
import { connect } from "react-redux";
import { instructorsSelector, upsertInstructor } from "../../api/actions";
import { InstructorsList } from "../../components/instructors";
import { EditableField } from "../../components/edit-field-widgets";
import { FaTrash } from "react-icons/fa";
import { Button } from "react-bootstrap";

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
    const {
        upsertInstructor,
        inDeleteMode,
        setDeleteDialogVisible,
        ...rest
    } = props;
    console.log(props);

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
    ];

    const deleteColumn = {
        // todo: weird top padding
        Header: "Delete",
        Cell: (
            <Button onClick={setDeleteDialogVisible} variant="outline-danger">
                <FaTrash />
            </Button>
        ),
    };

    return (
        <InstructorsList
            columns={inDeleteMode ? [deleteColumn, ...columns] : columns}
            {...rest}
        />
    );
}

/**
 * EditableInstructorsList that has been connected to the redux store
 * for live updates and editability.
 */
export const ConnectedInstructorsList = connect(
    (state) => ({
        instructors: instructorsSelector(state),
    }),
    { upsertInstructor }
)(EditableInstructorsList);
