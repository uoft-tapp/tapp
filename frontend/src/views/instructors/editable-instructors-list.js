import React from "react";
import { connect } from "react-redux";
import {
    instructorsSelector,
    upsertInstructor,
    deleteInstructor,
    positionsSelector,
} from "../../api/actions";
import { InstructorsList } from "../../components/instructors";
import { EditableField } from "../../components/edit-field-widgets";
import { DeleteInstructorDialog } from "./delete-instructor-dialog";
import { FaMinusCircle, FaTrash } from "react-icons/fa";

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

/**
 * A button that deletes the instructor
 * @param {*} onClick: click handler function for clicking the delete icon
 */
function DeleteButtonCell({ onClick }) {
    return (
        <FaMinusCircle className="delete-instructor-button" onClick={onClick} />
    );
}

function EditableInstructorsList(props) {
    const {
        upsertInstructor,
        deleteInstructor,
        inDeleteMode,
        positions,
        ...rest
    } = props;

    const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false);
    const [instructorToDelete, setInstructorToDelete] = React.useState(null);

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

    const instructorCurrentlyAssignedHash = {};
    (positions || []).map((position) =>
        position.instructors.map(
            (instructor) =>
                (instructorCurrentlyAssignedHash[instructor.id] = true)
        )
    );

    const columns = [
        {
            Header: (
                <FaTrash className="delete-instructor-column-header-icon" />
            ),
            // props.original contains the row data for this particular instructor
            Cell: ({ original: instructor }) => {
                // if the instructor is currently assigned, no button will be rendered.
                const disabled =
                    instructorCurrentlyAssignedHash[instructor.id] === true;
                return disabled ? null : (
                    <DeleteButtonCell
                        onClick={() => {
                            setInstructorToDelete(instructor);
                            setDeleteDialogVisible(true);
                        }}
                    />
                );
            },
            show: inDeleteMode,
            maxWidth: 32,
            resizable: false,
        },
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

    return (
        <React.Fragment>
            <InstructorsList columns={columns} {...rest} />
            <DeleteInstructorDialog
                show={deleteDialogVisible}
                onHide={() => {
                    setDeleteDialogVisible(false);
                    setInstructorToDelete(null);
                }}
                onDelete={() => {
                    deleteInstructor(instructorToDelete);
                    setDeleteDialogVisible(false);
                }}
                instructor={instructorToDelete}
            />
        </React.Fragment>
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
    { upsertInstructor, deleteInstructor }
)(EditableInstructorsList);
