import React from "react";
import { connect } from "react-redux";
import {
    instructorsSelector,
    upsertInstructor,
    deleteInstructor,
    positionsSelector,
} from "../../../api/actions";
import { InstructorsList } from "../../../components/instructors";
import { DeleteInstructorDialog } from "./delete-instructor-dialog";
import { FaTrash, FaLock, FaTimes } from "react-icons/fa";
import { EditableCell } from "../../../components/editable-cell";
import { CellProps } from "react-table";
import { Instructor, Position } from "../../../api/defs/types";

function EditableInstructorsList(props: {
    upsertInstructor: (instructor: Partial<Instructor>) => any;
    deleteInstructor: (instructor: { id: number }) => any;
    inDeleteMode: boolean;
    positions: Position[];
    instructors: Instructor[];
}) {
    const {
        upsertInstructor,
        deleteInstructor,
        inDeleteMode,
        positions,
        ...rest
    } = props;

    const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false);
    const [instructorToDelete, setInstructorToDelete] =
        React.useState<Instructor | null>(null);

    function generateCell(field: keyof Instructor) {
        return (props: CellProps<Instructor>) => (
            <EditableCell field={field} upsert={upsertInstructor} {...props} />
        );
    }

    const instructorCurrentlyAssignedHash: Record<number, boolean> = {};
    for (const position of positions || []) {
        for (const instructor of position.instructors || []) {
            instructorCurrentlyAssignedHash[instructor.id] = true;
        }
    }

    // props.original contains the row data for this particular instructor
    function CellDeleteButton({ row }: CellProps<Instructor>) {
        const instructor = row.original;
        const disabled = instructorCurrentlyAssignedHash[instructor.id];
        if (disabled) {
            return (
                <div className="delete-button-container">
                    <FaLock
                        className="delete-row-button disabled"
                        title="This instructor is assigned to a position and so cannot be deleted. Unassign the instructor from all positions to delete."
                    />
                </div>
            );
        }
        return (
            <div className="delete-button-container">
                <FaTimes
                    className="delete-row-button"
                    title={`Delete ${instructor.last_name}, ${instructor.first_name}`}
                    onClick={() => {
                        setInstructorToDelete(instructor);
                        setDeleteDialogVisible(true);
                    }}
                />
            </div>
        );
    }

    const columns = [
        {
            Header: <FaTrash className="delete-row-column-header-icon" />,
            id: "delete_col",
            className: "delete-col",
            Cell: CellDeleteButton,
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
            minWidth: 150,
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
                    if (!instructorToDelete) {
                        return;
                    }
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
