import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    positionsSelector,
    deletePosition,
    assignmentsSelector,
} from "../../api/actions";
import { PositionsList } from "../../components/positions-list";
import { formatDate } from "../../libs/utils";
import { FaTimes, FaLock, FaTrash } from "react-icons/fa";
import { Badge, Modal, Button } from "react-bootstrap";

function ConfirmDeleteDialog(props) {
    const { show, onHide, onDelete, position } = props;
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Session</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete the position{" "}
                {position ? position.position_code : null}? This action cannot
                be undone.
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button onClick={onDelete} title="Delete Position">
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export function ConnectedPositionsList({ inDeleteMode = false }) {
    const positions = useSelector(positionsSelector);
    const assignments = useSelector(assignmentsSelector);
    const [positionToDelete, setPositionToDelete] = React.useState(null);
    const dispatch = useDispatch();

    const positionsCurrentlyAssigned = new Set(
        assignments.map((a) => a.position.id)
    );

    // props.original contains the row data for this particular instructor
    function CellDeleteButton({ original: position }) {
        const disabled = positionsCurrentlyAssigned.has(position.id);
        if (disabled) {
            return (
                <div className="delete-button-container">
                    <FaLock
                        className="delete-instructor-button disabled"
                        title="This position has an associated assignment and so cannot be deleted."
                    />
                </div>
            );
        }
        return (
            <div className="delete-button-container">
                <FaTimes
                    className="delete-instructor-button"
                    title={`Delete ${position.last_name}, ${position.first_name}`}
                    onClick={() => {
                        setPositionToDelete(position);
                    }}
                />
            </div>
        );
    }

    const DEFAULT_COLUMNS = [
        {
            Header: (
                <FaTrash className="delete-instructor-column-header-icon" />
            ),
            Cell: CellDeleteButton,
            show: inDeleteMode,
            maxWidth: 32,
            resizable: false,
        },
        { Header: "Position Code", accessor: "position_code" },
        { Header: "Position Title", accessor: "position_title" },
        { Header: "Hours", accessor: "hours_per_assignment", maxWidth: 64 },
        {
            Header: "Start",
            accessor: "start_date",
            Cell: (row) => formatDate(row.value),
        },
        {
            Header: "End",
            accessor: "end_date",
            Cell: (row) => formatDate(row.value),
        },
        {
            Header: "Instructors",
            accessor: "instructors",
            Cell: (props) => (
                <React.Fragment>
                    {props.value.map((instructor = {}) => {
                        const name = `${instructor.first_name} ${instructor.last_name}`;
                        return (
                            <Badge
                                variant="secondary"
                                className="mr-1"
                                key={name}
                            >
                                {name}
                            </Badge>
                        );
                    })}
                </React.Fragment>
            ),
        },
        {
            Header: "Enrolled",
            accessor: "current_enrollment",
            maxWidth: 80,
        },
        {
            Header: "Waitlist",
            accessor: "current_waitlisted",
            maxWidth: 90,
        },

        {
            Header: "Contract Template",
            accessor: "contract_template.template_name",
        },
    ];

    return (
        <React.Fragment>
            <PositionsList positions={positions} columns={DEFAULT_COLUMNS} />
            <ConfirmDeleteDialog
                position={positionToDelete}
                show={!!positionToDelete}
                onHide={() => setPositionToDelete(null)}
                onDelete={async () => {
                    await dispatch(deletePosition(positionToDelete));
                    setPositionToDelete(null);
                }}
            />
        </React.Fragment>
    );
}
