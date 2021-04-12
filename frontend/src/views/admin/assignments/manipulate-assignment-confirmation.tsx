import React from "react";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { Button, Modal } from "react-bootstrap";
import { Assignment } from "../../../api/defs/types";
import { compareAssignment } from "../../../libs/compare-table-rows";

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

export function MultiManipulateOfferConfirmation(props: {
    data: Assignment[];
    visible: boolean;
    setVisible: (visibility: boolean) => void;
    manipulateOffers: () => void;
    titleMsg: String;
    alertMsg: String;
    confirmBtnMsg: String;
}) {
    const {
        data,
        visible,
        setVisible,
        manipulateOffers,
        titleMsg,
        alertMsg,
        confirmBtnMsg,
    } = props;

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
                <Modal.Title>{titleMsg}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3 alert alert-info" role="alert">
                    {alertMsg}
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
                <Button
                    onClick={() => {
                        manipulateOffers();
                        setVisible(false);
                    }}
                >
                    {confirmBtnMsg}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
