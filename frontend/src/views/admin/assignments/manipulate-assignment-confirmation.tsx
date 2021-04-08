import React from "react";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { Button, Modal } from "react-bootstrap";
import { Assignment } from "../../../api/defs/types";

const manipulateModalColumn = [
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

function compareString(str1: string, str2: string) {
    if (str1 > str2) {
        return 1;
    } else if (str1 < str2) {
        return -1;
    }
    return 0;
}

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

export function MultiManipulateOfferConfirmation(props: {
    data: Assignment[];
    visible: boolean;
    setVisible: (visibility: boolean) => void;
    manipulateOffers: () => void;
    action: String;
}) {
    const { data, visible, setVisible, manipulateOffers, action } = props;

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
                <Modal.Title>{action}ing Multiple Offers</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3 alert alert-info" role="alert">
                    You are <b>{action.toLowerCase()}ing</b> the following{" "}
                    {data?.length} offers:
                </div>
                <div className="mb-3">
                    <AdvancedFilterTable
                        filterable={false}
                        columns={manipulateModalColumn}
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
                <Button
                    onClick={() => {
                        manipulateOffers();
                        setVisible(false);
                    }}
                >
                    {action} {data?.length} Offers
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
