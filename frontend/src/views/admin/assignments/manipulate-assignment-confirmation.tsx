import React from "react";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { Button, Modal } from "react-bootstrap";
import { Assignment } from "../../../api/defs/types";
import { compareAssignment, assignmentModalColumn } from "./utils";

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
