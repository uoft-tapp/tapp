import React from "react";
import { connect } from "react-redux";
import {
    instructorsSelector,
    upsertInstructor,
    positionsSelector,
} from "../../api/actions";
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
        setInDeleteMode,
        setDeleteDialogVisible,
        setInstructorToDelete,
        positions,
        ...rest
    } = props;

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

    const workingInstructors = new Set(
        positions
            .map((position) =>
                position.instructors.map((instructor) => instructor.id)
            )
            .flat()
    );

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

    function deleteButtonOnClick(instructor) {
        setInstructorToDelete(instructor);
        setDeleteDialogVisible(true);
    }

    const deleteColumn = {
        // todo: weird top padding
        Header: "Delete",
        Cell: (props) => {
            const instructor = props.original;
            const disabled = workingInstructors.has(instructor.id);
            return disabled ? null : (
                <Button
                    onClick={() => deleteButtonOnClick(instructor)}
                    variant="outline-danger"
                >
                    <FaTrash />
                </Button>
            );
        },
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
        positions: positionsSelector(state),
    }),
    { upsertInstructor }
)(EditableInstructorsList);
