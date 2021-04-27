import React from "react";
import { useSelector } from "react-redux";
import {
    positionsSelector,
    deletePosition,
    assignmentsSelector,
    upsertPosition,
    instructorsSelector,
} from "../../../api/actions";
import { PositionsList } from "../../../components/positions-list";
import { FaTimes, FaLock, FaTrash, FaSearch } from "react-icons/fa";
import { Badge, Modal, Button, Spinner } from "react-bootstrap";
import { EditFieldIcon } from "../../../components/edit-field-widgets";
import { Typeahead } from "react-bootstrap-typeahead";
import { generateHeaderCell } from "../../../components/table-utils";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { HasId, Instructor, Position } from "../../../api/defs/types";
import { Cell, Column } from "react-table";
import { EditableCell, EditableType } from "../../../components/editable-cell";
import { setSelectedPosition } from "./actions";

/**
 * Turn a list of instructor objects into a hash string for comparison as to whether
 * an instructor list has changed.
 *
 * @param {*} instructors
 * @returns
 */
function hashInstructorList(instructors: Instructor[]) {
    return instructors
        .map((i) => `${i.last_name}, ${i.first_name}`)
        .sort()
        .join(";");
}

/**
 * A dialog allowing one to edit instructors. `onChange` is called
 * when "save" is clicked while editing this value.
 *
 * @param {*} props
 * @returns
 */
function EditInstructorsDialog({
    position,
    show,
    onHide,
    onChange,
}: {
    position: Position;
    show: boolean;
    onHide: Function;
    onChange: Function;
}) {
    const value = position.instructors;
    const allInstructors = useSelector(instructorsSelector);
    const [fieldVal, setFieldVal] = React.useState(value);
    const [inProgress, setInProgress] = React.useState(false);

    function cancelClick() {
        setFieldVal(value);
        onHide();
    }

    function saveClick() {
        async function doSave() {
            if (hashInstructorList(fieldVal) !== hashInstructorList(value)) {
                setInProgress(true);
                // Only call `onChange` if the value has changed
                await onChange(fieldVal, value);
            }
        }
        doSave().finally(() => {
            //onHide();
            setInProgress(false);
        });
    }
    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="mr-1" />
    ) : null;

    const changeIndicator =
        // eslint-disable-next-line
        hashInstructorList(fieldVal) == hashInstructorList(value) ? null : (
            <span>
                Change from{" "}
                <span className="field-dialog-formatted-name">
                    {value
                        .map(
                            (instructor) =>
                                `${instructor.first_name} ${instructor.last_name}`
                        )
                        .join(", ")}
                </span>{" "}
                to{" "}
                <span className="field-dialog-formatted-name">
                    {fieldVal
                        .map(
                            (instructor) =>
                                `${instructor.first_name} ${instructor.last_name}`
                        )
                        .join(", ")}
                </span>
            </span>
        );

    return (
        <Modal show={show} onHide={cancelClick}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Edit Instructors for {position.position_code}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Typeahead
                    id="instructors-input"
                    ignoreDiacritics={true}
                    multiple
                    placeholder="Instructors..."
                    labelKey={(option) =>
                        `${option.first_name} ${option.last_name}`
                    }
                    selected={fieldVal}
                    options={allInstructors}
                    onChange={setFieldVal}
                />{" "}
                {changeIndicator}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={cancelClick} variant="outline-secondary">
                    Cancel
                </Button>
                <Button onClick={saveClick}>{spinner}Save</Button>
            </Modal.Footer>
        </Modal>
    );
}

export function EditInstructorsCell({ row }: { row: { original: Position } }) {
    const position = row.original;
    const [dialogShow, setDialogShow] = React.useState(false);
    const dispatch = useThunkDispatch();

    return (
        <div className="show-on-hover-wrapper">
            {position.instructors.map((instructor = {} as any) => {
                const name = `${instructor.first_name} ${instructor.last_name}`;
                return (
                    <Badge variant="secondary" className="mr-1" key={name}>
                        {name}
                    </Badge>
                );
            })}
            <EditFieldIcon
                title="Edit the instructors for this position"
                hidden={false}
                onClick={() => setDialogShow(true)}
            />
            <EditInstructorsDialog
                position={position}
                show={dialogShow}
                onHide={() => setDialogShow(false)}
                onChange={async (newInstructors: Instructor[]) => {
                    await dispatch(
                        upsertPosition({
                            id: position.id,
                            instructors: newInstructors,
                        })
                    );
                    setDialogShow(false);
                }}
            />
        </div>
    );
}

function ConfirmDeleteDialog(props: {
    show: boolean;
    onHide: (...args: any[]) => any;
    onDelete: (...args: any[]) => any;
    position: Position | null;
}) {
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

export function ConnectedPositionsList({
    inDeleteMode = false,
    editable = true,
    columns = null,
}: {
    inDeleteMode?: boolean;
    editable?: boolean;
    columns?: Column<any>[] | null;
}) {
    const positions = useSelector(positionsSelector);
    const assignments = useSelector(assignmentsSelector);
    const [
        positionToDelete,
        setPositionToDelete,
    ] = React.useState<Position | null>(null);
    const dispatch = useThunkDispatch();

    async function _upsertPosition(position: Partial<Position> & HasId) {
        return await dispatch(upsertPosition(position));
    }

    const numAssignmentsByPositionCode = assignments.reduce(
        (acc, assignment) => {
            const position_code = assignment.position.position_code;
            acc[position_code] = acc[position_code] || 0;
            acc[position_code] += 1;
            return acc;
        },
        {} as Record<string, number>
    );

    // props.original contains the row data for this particular instructor
    function CellDeleteButton({ row }: Cell<Position>) {
        const position = row.original;
        // If there are any assignments for this position, we should be disabled
        const disabled = numAssignmentsByPositionCode[position.position_code];
        if (disabled) {
            return (
                <div className="delete-button-container">
                    <FaLock
                        className="delete-row-button disabled"
                        title="This position has an associated assignment and so cannot be deleted."
                    />
                </div>
            );
        }
        return (
            <div className="delete-button-container">
                <FaTimes
                    className="delete-row-button"
                    title={`Delete ${position.position_code}`}
                    onClick={() => {
                        setPositionToDelete(position);
                    }}
                />
            </div>
        );
    }

    function generateCell(field: keyof Position, type?: EditableType) {
        return (props: Cell<Position>) => (
            <EditableCell
                field={field}
                type={type}
                upsert={_upsertPosition}
                editable={editable}
                {...props}
            />
        );
    }

    function CellDetailsButton({ row }: Cell<Position>) {
        const position = row?.original || {};
        return (
            <div
                className="details-button-container"
                onClick={() => dispatch(setSelectedPosition(position.id))}
            >
                <FaSearch
                    className="details-row-button"
                    title={`View details of ${position.position_code}`}
                />
            </div>
        );
    }

    const DEFAULT_COLUMNS = [
        {
            Header: <FaTrash className="delete-row-column-header-icon" />,
            Cell: CellDeleteButton,
            id: "delete_col",
            className: "delete-col",
            show: inDeleteMode,
            maxWidth: 32,
            resizable: false,
        },
        {
            Header: generateHeaderCell("Details"),
            id: "details-col",
            className: "details-col",
            maxWidth: 32,
            resizable: false,
            Cell: CellDetailsButton,
        },
        {
            Header: generateHeaderCell("Position Code"),
            accessor: "position_code",
            Cell: generateCell("position_code"),
        },
        {
            Header: generateHeaderCell("Position Title"),
            accessor: "position_title",
            Cell: generateCell("position_title"),
        },
        {
            Header: generateHeaderCell("Start"),
            accessor: "start_date",
            Cell: generateCell("start_date", "date"),
        },
        {
            Header: generateHeaderCell("End"),
            accessor: "end_date",
            Cell: generateCell("end_date", "date"),
        },
        {
            Header: generateHeaderCell("Instructor(s)"),
            id: "instructors",
            accessor: (position: Position) =>
                hashInstructorList(position.instructors),
            Cell: EditInstructorsCell,
        },
        {
            Header: generateHeaderCell("Hours/Assignment"),
            accessor: "hours_per_assignment",
            maxWidth: 64,
            className: "number-cell",
            Cell: generateCell("hours_per_assignment"),
        },
        {
            Header: generateHeaderCell("Enrolled"),
            accessor: "current_enrollment",
            className: "number-cell",
            maxWidth: 80,
            Cell: generateCell("current_enrollment"),
        },
        {
            Header: generateHeaderCell("Waitlist"),
            accessor: "current_waitlisted",
            className: "number-cell",
            maxWidth: 50,
            Cell: generateCell("current_waitlisted", "number"),
        },
        {
            Header: generateHeaderCell("Desired Num Assignments"),
            accessor: "desired_num_assignments",
            className: "number-cell",
            maxWidth: 50,
            Cell: generateCell("desired_num_assignments"),
        },
        {
            Header: generateHeaderCell("Current Num Assignments"),
            id: "current_num_assignments",
            className: "number-cell",
            accessor: (position: Position) =>
                numAssignmentsByPositionCode[position.position_code] || "",
            maxWidth: 50,
        },
        {
            Header: generateHeaderCell("Contract Template"),
            accessor: "contract_template.template_name",
        },
    ];

    return (
        <React.Fragment>
            <PositionsList
                positions={positions}
                columns={columns || DEFAULT_COLUMNS}
            />
            <ConfirmDeleteDialog
                position={positionToDelete}
                show={!!positionToDelete}
                onHide={() => setPositionToDelete(null)}
                onDelete={async () => {
                    if (positionToDelete == null) {
                        return;
                    }
                    await dispatch(deletePosition(positionToDelete));
                    setPositionToDelete(null);
                }}
            />
        </React.Fragment>
    );
}
