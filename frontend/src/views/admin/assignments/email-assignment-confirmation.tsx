import React from "react";
import { AdvancedFilterTable } from "../../../components/filter-table/advanced-filter-table";
import { Button, Modal } from "react-bootstrap";
import { Assignment } from "../../../api/defs/types";
import { compareAssignment, assignmentModalColumn } from "./utils";

export function MultiEmailOfferConfirmation(props: {
    data: Assignment[];
    visible: boolean;
    setVisible: (visibility: boolean) => void;
    emailOffers: () => void;
}) {
    const { data, visible, setVisible, emailOffers } = props;

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
                <Modal.Title>Emailing Multiple Offers</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3 alert alert-info" role="alert">
                    You are <b>emailing</b> the following {data?.length} offers:
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
                        emailOffers();
                        setVisible(false);
                    }}
                >
                    Email {data?.length} Offers
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
