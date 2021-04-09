import React from "react";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { Button, Modal } from "react-bootstrap";
import { Assignment } from "../../../api/defs/types";

const withdrawModalColumn = [
    {
        Header: "Last Name",
        accessor: "applicant.last_name"
    },
    {
        Header: "First Name",
        accessor: "applicant.first_name"
    },
    {
        Header: "Position",
        accessor: "position.position_code"
    },
    {
        Header: "Hours",
        accessor: "hours",
        className: "number-cell"
    },
    {
        Header: "Status",
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

export function MultiWithdrawOfferConfirmation(props: {
    data: Assignment[];
    visible: boolean;
    setVisible: (visibility: boolean) => void;
    withdrawOffers: () => void;
}) {
    const { data, visible, setVisible, withdrawOffers } = props;

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
                <Modal.Title>Withdrawing Multiple Offers</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3 alert alert-info" role="alert">
                    You are <b>withdrawing</b> from the following {data?.length}{" "}
                    offers:
                </div>
                <div className="mb-3">
                    <AdvancedFilterTable
                        filterable={false}
                        columns={withdrawModalColumn}
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
                        withdrawOffers();
                        setVisible(false);
                    }}
                >
                    Withdraw {data?.length} Offers
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
