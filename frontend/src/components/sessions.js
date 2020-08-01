import React from "react";
import ReactTable from "react-table";
import { useSelector, useDispatch } from "react-redux";
import { sessionsSelector, upsertSession, deleteSession } from "../api/actions";
import { EditableField } from "./edit-field-widgets";
import { formatDate } from "../libs/utils";
import { Alert, Modal, Button } from "react-bootstrap";
import { FaTimes, FaTrash } from "react-icons/fa";
import { generateHeaderCell } from "./table-utils";

function EditableCell(props) {
    const title = `Edit ${"" + props.column.Header}`;
    const { upsertSession, field, type, value } = props;
    const isDate = type === "date";

    function onChange(newVal) {
        const sessionId = props.original.id;
        upsertSession({ id: sessionId, [field]: newVal });
    }

    return (
        <EditableField
            title={title}
            value={type === "date" ? (value || "").slice(0, 10) : value || ""}
            onChange={onChange}
            type={type}
        >
            {isDate ? formatDate(value) : value}
        </EditableField>
    );
}

function ConfirmDeleteDialog(props) {
    const { show, onHide, onDelete, session } = props;
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Session</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete the session{" "}
                {(session || {}).name}? This action cannot be undone.
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button onClick={onDelete} title="Delete Session">
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

/**
 * List the sessions using a ReactTable. `columns` can be passed
 * in to customize columns/cell renderers.
 *
 * @export
 * @param {{columns?: object[], inDeleteMode?: Boolean}} props
 * @returns
 */
export function ConnectedSessionsList(props) {
    const { inDeleteMode = false } = props;
    const [sessionToDelete, setSessionToDelete] = React.useState(null);
    const sessions = useSelector(sessionsSelector);
    const dispatch = useDispatch();
    const pageSize = sessions?.length || 20;

    function _upsertSession(session) {
        return dispatch(upsertSession(session));
    }

    function generateCell(field, type) {
        return (props) => (
            <EditableCell
                field={field}
                upsertSession={_upsertSession}
                type={type}
                {...props}
            />
        );
    }

    // props.original contains the row data for this particular instructor
    function CellDeleteButton({ original: session }) {
        return (
            <div className="delete-button-container">
                <FaTimes
                    className="delete-instructor-button"
                    title={`Delete ${session.name}`}
                    onClick={() => {
                        setSessionToDelete(session);
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
        {
            Header: generateHeaderCell("Name"),
            accessor: "name",
            Cell: generateCell("name"),
        },
        {
            Header: generateHeaderCell("Start Date"),
            accessor: "start_date",
            Cell: generateCell("start_date", "date"),
        },
        {
            Header: generateHeaderCell("End Date"),
            accessor: "end_date",
            Cell: generateCell("end_date", "date"),
        },
        {
            Header: generateHeaderCell("Rate (Pre-January)"),
            accessor: "rate1",
            className: "number-cell",
            Cell: generateCell("rate1"),
        },
        {
            Header: generateHeaderCell("Rate (Post-January)"),
            accessor: "rate2",
            className: "number-cell",
            Cell: generateCell("rate2"),
        },
    ];

    const { columns = DEFAULT_COLUMNS } = props;
    return (
        <React.Fragment>
            <ReactTable
                data={sessions}
                columns={columns}
                showPagination={false}
                defaultPageSize={pageSize}
                pageSize={pageSize}
                minRows={1}
            />
            <ConfirmDeleteDialog
                session={sessionToDelete}
                show={!!sessionToDelete}
                onHide={() => setSessionToDelete(null)}
                onDelete={async () => {
                    await dispatch(deleteSession(sessionToDelete));
                    setSessionToDelete(null);
                }}
            />
        </React.Fragment>
    );
}

export function MissingActiveSessionWarning({ extraText = "" }) {
    return (
        <Alert variant="info">
            There is no active session selected. {extraText}
        </Alert>
    );
}
