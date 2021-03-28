import { useDispatch } from "react-redux";
import React from "react";
import { AdvancedFilterTable } from "../../components/filter-table/advanced-filter-table";
import { Button, Modal, Alert } from "react-bootstrap";

function compareString(str1, str2) {
    if (str1 > str2) {
        return 1;
    } else if (str1 < str2) {
        return -1;
    }
    return 0;
}

export function CreateOfferConfirmation(props) {
    const dispatch = useDispatch();
    const { data, visible, setVisible, createOffers } = props;

    // We want to minimize the re-render of the table. Since some bindings for columns
    // are generated on-the-fly, memoize the result so we don't trigger unneeded re-renders.

    data.sort((a1, a2) => {
        return (
            compareString(a1.position_code, a2.position_code) ||
            compareString(a1.last_name, a2.last_name) ||
            compareString(a1.first_name, a2.first_name)
        );
    });

    const columns = React.useMemo(() => {
        return [
            {
                Header: "Last Name",
                accessor: "applicant.last_name",
            },
            {
                Header: "First Name",
                accessor: "applicant.first_name",
            },
            {
                Header: "Position",
                accessor: "position.position_code",
            },
            {
                Header: "Hours",
                accessor: "hours",
                className: "number-cell",
                maxWidth: 70,
            },
            {
                Header: "Status",
                id: "status",
                // We want items with no active offer to appear at the end of the list
                // when sorted, so we set their accessor to null (the accessor is used by react table
                // when sorting items).
                accessor: (data) =>
                    data.active_offer_status === "No Contract"
                        ? null
                        : data.active_offer_status,
            },
        ];
    }, [dispatch]);

    return (
        <Modal
            show={visible}
            onHide={() => {
                setVisible(false);
            }}
            size="lg"
        >
            <Modal.Header closeButton>
                <Modal.Title>Creating Offers</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <Alert variant="info">
                        You are creating offers for {data?.length} assignments,
                        some of which have previously been{" "}
                        <strong>withdrawn</strong>
                    </Alert>
                </div>
                <div className="mb-3">
                    <AdvancedFilterTable
                        filterable={false}
                        columns={columns}
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
                        createOffers();
                        setVisible(false);
                    }}
                >
                    Create {data?.length} Offers
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
