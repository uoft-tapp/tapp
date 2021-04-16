import React from "react";
import { useSelector } from "react-redux";
import {
    applicationsSelector,
    assignmentsSelector,
    upsertApplicant,
    upsertApplication,
} from "../../../api/actions";
import type {
    Applicant,
    Application,
    Assignment,
} from "../../../api/defs/types";
import { ApplicationsList } from "../../../components/applications";
import { generateHeaderCell } from "../../../components/table-utils";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { Cell } from "react-table";
import { FaSearch } from "react-icons/fa";
import { Button, Modal } from "react-bootstrap";
import { ApplicationDetails } from "./application-details";
import { EditableCell } from "../../../components/editable-cell";

export function ConnectedApplicationsList() {
    const applicants = useSelector(applicationsSelector) as Application[];
    const assignments = useSelector(assignmentsSelector) as Assignment[];
    const dispatch = useThunkDispatch();
    // If `shownApplication` is non-null, a dialog will be displayed with its details.
    const [
        shownApplication,
        setShownApplication,
    ] = React.useState<Application | null>(null);

    const assignmentsHash: { [key: string]: boolean } = {};
    for (const assignment of assignments) {
        assignmentsHash[assignment.applicant.id] = true;
    }

    function _upsertApplication(applicant: Partial<Application>) {
        return dispatch(upsertApplication(applicant));
    }

    function _upsertApplicant(applicant: Partial<Applicant>) {
        return dispatch(upsertApplicant(applicant));
    }

    /**
     * Factory that returns a cell to edit the Applicant referenced by an Application.
     *
     * @param {string} field
     * @returns
     */
    function generateApplicantCell(field: keyof Applicant) {
        return (props: Cell<Application>) => {
            const application = props.row.original;
            return (
                <EditableCell
                    column={props.column}
                    value={props.value}
                    field={field}
                    upsert={_upsertApplicant}
                    row={{ original: application.applicant }}
                />
            );
        };
    }

    function generateApplicationCell(field: keyof Application) {
        return (props: Cell<Application>) => (
            <EditableCell
                column={props.column}
                value={props.value}
                field={field}
                upsert={_upsertApplication}
                row={props.row}
            />
        );
    }

    // props.original contains the row data for this particular session
    function CellDetailsButton({ row }: Cell<Application>) {
        const application = row?.original || {};
        return (
            <div
                className="details-button-container"
                onClick={() => setShownApplication(application)}
            >
                <FaSearch
                    className="details-row-button"
                    title={`View details of ${application.applicant.first_name} ${application.applicant.last_name}'s Application`}
                />
            </div>
        );
    }

    const DEFAULT_COLUMNS = [
        {
            Header: generateHeaderCell("Details"),
            id: "details-col",
            className: "details-col",
            maxWidth: 32,
            resizable: false,
            Cell: CellDetailsButton,
        },
        {
            Header: generateHeaderCell("Posting"),
            accessor: "posting.name",
            width: 90,
        },
        {
            Header: generateHeaderCell("Program"),
            accessor: "program",
            Cell: generateApplicationCell("program"),
            width: 50,
        },
        {
            Header: generateHeaderCell("YIP"),
            accessor: "yip",
            Cell: generateApplicationCell("yip"),
            width: 50,
        },
        {
            Header: generateHeaderCell("Last Name"),
            accessor: "applicant.last_name",
            Cell: generateApplicantCell("last_name"),
        },
        {
            Header: generateHeaderCell("First Name"),
            accessor: "applicant.first_name",
            Cell: generateApplicantCell("first_name"),
        },
        {
            Header: generateHeaderCell("Email"),
            accessor: "applicant.email",
            Cell: generateApplicantCell("email"),
        },
        {
            Header: generateHeaderCell("Department"),
            Cell: generateApplicationCell("department"),
            accessor: "department",
        },
        {
            Header: generateHeaderCell("UTORid"),
            accessor: "applicant.utorid",
            Cell: generateApplicantCell("utorid"),
        },
        {
            Header: generateHeaderCell("Student Number"),
            accessor: "applicant.student_number",
            Cell: generateApplicantCell("student_number"),
        },
        {
            Header: generateHeaderCell("Phone"),
            accessor: "applicant.phone",
            Cell: generateApplicantCell("phone"),
        },
    ];

    return (
        <React.Fragment>
            <ApplicationsList
                applicants={applicants}
                columns={DEFAULT_COLUMNS}
            />

            <Modal
                show={!!shownApplication}
                onHide={() => setShownApplication(null)}
                size="xl"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Application Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {shownApplication && (
                        <ApplicationDetails application={shownApplication} />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => setShownApplication(null)}
                        variant="outline-secondary"
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
}
