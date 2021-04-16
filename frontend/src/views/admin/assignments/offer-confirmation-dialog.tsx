import React from "react";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { Button, Modal, Spinner } from "react-bootstrap";
import { Assignment } from "../../../api/defs/types";
import { compareString } from "../../../libs/utils";

const assignmentModalColumn = [
    {
        Header: "Last Name",
        accessor: "applicant.last_name",
        maxWidth: 120,
    },
    {
        Header: "First Name",
        accessor: "applicant.first_name",
        maxWidth: 120,
    },
    {
        Header: "Position",
        accessor: "position.position_code",
        width: 200,
    },
    {
        Header: "Hours",
        accessor: "hours",
        className: "number-cell",
        maxWidth: 70,
    },
    {
        Header: "Status",
        maxWidth: 100,
        id: "status",
        // We want items with no active offer to appear at the end of the list
        // when sorted, so we set their accessor to null (the accessor is used by react table
        // when sorting items).
        accessor: (data: { active_offer_status: string }) =>
            data.active_offer_status === "No Contract"
                ? null
                : data.active_offer_status,
    },
];

function compareAssignment(a1: Assignment, a2: Assignment) {
    return (
        compareString(a1.position.position_code, a2.position.position_code) ||
        compareString(
            a1.applicant.last_name || "",
            a2.applicant.last_name || ""
        ) ||
        compareString(a1.applicant.first_name, a2.applicant.first_name)
    );
}

export function OfferConfirmationDialog(props: {
    data: Assignment[];
    visible: boolean;
    setVisible: Function;
    callback: Function;
    title: string;
    body: string;
    confirmation: string;
}) {
    const {
        data,
        visible,
        setVisible,
        callback,
        title,
        body,
        confirmation,
    } = props;

    const [inProgress, setInProgress] = React.useState(false);

    async function executeCallback() {
        setInProgress(true);
        await callback();
        setInProgress(false);
        setVisible(false);
    }

    // When a confirm operation is in progress, a spinner is displayed; otherwise
    // it's hidden
    const spinner = inProgress ? (
        <Spinner animation="border" size="sm" className="mr-1" />
    ) : null;

    // We want to minimize the re-render of the table. Since some bindings for columns
    // are generated on-the-fly, memoize the result so we don't trigger unneeded re-renders.

    data.sort(compareAssignment);

    return (
        <Modal
            show={visible}
            onHide={() => {
                setVisible(false);
            }}
            size="lg"
        >
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3 alert alert-info" role="alert">
                    {body}
                </div>
                <div className="mb-3">
                    <AdvancedFilterTable
                        filterable={false}
                        columns={assignmentModalColumn}
                        data={data}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    onClick={() => {
                        setVisible(false);
                    }}
                    variant="light"
                >
                    Cancel
                </Button>
                <Button onClick={executeCallback}>
                    {spinner}
                    {confirmation}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
