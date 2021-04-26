import React from "react";
import { useSelector } from "react-redux";
import {
    applicantsSelector,
    assignmentsSelector,
    deleteApplicant,
    upsertApplicant,
} from "../../../api/actions";
import type { Applicant, Assignment } from "../../../api/defs/types";
import { ApplicantsList } from "../../../components/applicants";
import { FaLock, FaTimes, FaTrash } from "react-icons/fa";
import { generateHeaderCell } from "../../../components/table-utils";
import { Button, Modal } from "react-bootstrap";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { EditableCell } from "../../../components/editable-cell";

function ConfirmDeleteDialog(props: {
    show: boolean;
    onHide: () => void;
    onDelete: () => void;
    applicant: Applicant | null;
}) {
    const { show, onHide, onDelete, applicant } = props;
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Applicant</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete the applicant{" "}
                <span className="text-info font-weight-bold">
                    {applicant
                        ? `${applicant.first_name} ${applicant.last_name}`
                        : null}
                </span>
                ? This action cannot be undone.
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button onClick={onDelete} title="Delete Applicant">
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export function ConnectedApplicantsList({ inDeleteMode = false }) {
    const applicants = useSelector(applicantsSelector) as Applicant[];
    const assignments = useSelector(assignmentsSelector) as Assignment[];
    const [
        applicantToDelete,
        setApplicantToDelete,
    ] = React.useState<Applicant | null>(null);
    const dispatch = useThunkDispatch();

    const assignmentsHash: { [key: string]: boolean } = {};
    for (const assignment of assignments) {
        assignmentsHash[assignment.applicant.id] = true;
    }

    function _upsertApplicant(applicant: Partial<Applicant>) {
        return dispatch(upsertApplicant(applicant));
    }

    // props.original contains the row data for this particular applicant
    function CellDeleteButton({ row }: any) {
        const applicant = row.original || row._original;
        const disabled = assignmentsHash[applicant.id];
        if (disabled) {
            return (
                <div className="delete-button-container">
                    <FaLock
                        className="delete-row-button disabled"
                        title="This applicant has an associated assignment and so cannot be deleted."
                    />
                </div>
            );
        }
        return (
            <div className="delete-button-container">
                <FaTimes
                    className="delete-row-button"
                    title={`Delete ${applicant.last_name}, ${applicant.first_name}`}
                    onClick={() => {
                        setApplicantToDelete(applicant);
                    }}
                />
            </div>
        );
    }

    function generateCell(field: string) {
        return (props: any) => (
            <EditableCell field={field} upsert={_upsertApplicant} {...props} />
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
            Header: generateHeaderCell("Last Name"),
            accessor: "last_name",
            Cell: generateCell("last_name"),
        },
        {
            Header: generateHeaderCell("First Name"),
            accessor: "first_name",
            Cell: generateCell("first_name"),
        },
        {
            Header: generateHeaderCell("Email"),
            accessor: "email",
            Cell: generateCell("email"),
        },
        {
            Header: generateHeaderCell("UTORid"),
            accessor: "utorid",
            Cell: generateCell("utorid"),
        },
        {
            Header: generateHeaderCell("Student Number"),
            accessor: "student_number",
            Cell: generateCell("student_number"),
        },
        {
            Header: generateHeaderCell("Phone"),
            accessor: "phone",
            Cell: generateCell("phone"),
        },
    ];

    return (
        <React.Fragment>
            <ApplicantsList applicants={applicants} columns={DEFAULT_COLUMNS} />
            <ConfirmDeleteDialog
                applicant={applicantToDelete}
                show={!!applicantToDelete}
                onHide={() => setApplicantToDelete(null)}
                onDelete={async () => {
                    if (applicantToDelete != null) {
                        await dispatch(deleteApplicant(applicantToDelete));
                        setApplicantToDelete(null);
                    }
                }}
            />
        </React.Fragment>
    );
}
