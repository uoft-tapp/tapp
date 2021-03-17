import React from "react";
import { connect, useDispatch } from "react-redux";
import { offerTableSelector } from "../offertable/actions";
import { assignmentsSelector } from "../../api/actions";
import {
    offerForAssignmentCreate,
    offerForAssignmentEmail,
    offerForAssignmentNag,
    offerForAssignmentWithdraw,
    setOfferForAssignmentAccepted,
    setOfferForAssignmentRejected,
} from "../../api/actions";
import {
    FaEnvelope,
    FaBan,
    FaCheck,
    FaUserTimes,
    FaUserClock,
    FaUserPlus,
} from "react-icons/fa";
import { ActionButton } from "../../components/action-buttons";
import { Button, Modal } from "react-bootstrap";
import { AdvancedFilterTable } from "../../components/filter-table/advanced-filter-table";

/**
 * Functions to test what actions you can do with a particular assignment
 */
const OfferTest = {
    canCreate(assignment) {
        return (
            assignment.active_offer_status == null ||
            assignment.active_offer_status === "withdrawn"
        );
    },
    canEmail(assignment) {
        return assignment.active_offer_status != null;
    },
    canNag(assignment) {
        return assignment.active_offer_status === "pending";
    },
    canWithdraw(assignment) {
        return assignment.active_offer_status != null;
    },
    canAccept(assignment) {
        return assignment.active_offer_status != null;
    },
    canReject(assignment) {
        return assignment.active_offer_status != null;
    },
};

function OfferActionButtons(props) {
    const selectedAssignments = props.assignments;
    const {
        offerForAssignmentCreate,
        offerForAssignmentEmail,
        offerForAssignmentNag,
        offerForAssignmentWithdraw,
        setOfferForAssignmentAccepted,
        setOfferForAssignmentRejected,
    } = props;

    const [
        ddahDeletionConfirmationVisible,
        setDdahDeletionConfirmationVisible,
    ] = React.useState(false);

    function createOffers() {
        for (const assignment of selectedAssignments) {
            offerForAssignmentCreate(assignment);
        }
    }
    function confirmOfferWithdraw() {
        function compareString(str1, str2) {
            if (str1 > str2) {
                return 1;
            } else if (str1 < str2) {
                return -1;
            }
            return 0;
        }

        // if withdrawing multiple offers at once, show confirmation
        if (selectedAssignments?.length > 1) {
            selectedAssignments.sort((a1, a2) => {
                return (
                    compareString(a1.position_code, a2.position_code) ||
                    compareString(a1.last_name, a2.last_name) ||
                    compareString(a1.first_name, a2.first_name)
                );
            });
            setDdahDeletionConfirmationVisible(true);
        } else {
            // does not need confirmation if only withdrawing one offer
            withdrawOffers();
        }
    }
    function withdrawOffers() {
        for (const assignment of selectedAssignments) {
            offerForAssignmentWithdraw(assignment);
        }
        setDdahDeletionConfirmationVisible(false);
    }
    function emailOffers() {
        for (const assignment of selectedAssignments) {
            offerForAssignmentEmail(assignment);
        }
    }
    function nagOffers() {
        for (const assignment of selectedAssignments) {
            offerForAssignmentNag(assignment);
        }
    }
    function acceptOffers() {
        for (const assignment of selectedAssignments) {
            setOfferForAssignmentAccepted(assignment);
        }
    }
    function rejectOffers() {
        for (const assignment of selectedAssignments) {
            setOfferForAssignmentRejected(assignment);
        }
    }

    const actionPermitted = {};
    for (const key of [
        "canCreate",
        "canEmail",
        "canNag",
        "canWithdraw",
        "canAccept",
        "canReject",
    ]) {
        actionPermitted[key] =
            selectedAssignments.length !== 0 &&
            selectedAssignments.every(OfferTest[key]);
    }

    function MultiWithdrawOfferConfirmationTable() {
        // const { editable = false } = props;
        const dispatch = useDispatch();
        const data = selectedAssignments;

        // We want to minimize the re-render of the table. Since some bindings for columns
        // are generated on-the-fly, memoize the result so we don't trigger unneeded re-renders.
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
            <AdvancedFilterTable
                filterable={true}
                columns={columns}
                data={data}
            />
        );
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaUserPlus />}
                onClick={createOffers}
                disabled={!actionPermitted.canCreate}
            >
                Create Offer
            </ActionButton>
            <ActionButton
                icon={<FaUserTimes />}
                onClick={confirmOfferWithdraw}
                disabled={!actionPermitted.canWithdraw}
            >
                Withdraw Offer
            </ActionButton>
            <ActionButton
                icon={<FaEnvelope />}
                onClick={emailOffers}
                disabled={!actionPermitted.canEmail}
            >
                Email Offer
            </ActionButton>
            <ActionButton
                icon={<FaUserClock />}
                onClick={nagOffers}
                disabled={!actionPermitted.canNag}
            >
                Nag Offer
            </ActionButton>
            <ActionButton
                icon={<FaCheck />}
                onClick={acceptOffers}
                disabled={!actionPermitted.canAccept}
            >
                Set as Accepted
            </ActionButton>
            <ActionButton
                icon={<FaBan />}
                onClick={rejectOffers}
                disabled={!actionPermitted.canReject}
            >
                Set as Rejected
            </ActionButton>
            <Modal
                show={ddahDeletionConfirmationVisible}
                onHide={() => {
                    setDdahDeletionConfirmationVisible(false);
                }}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Withdrawing Multiple Offers</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        You are withdrawing from the following{" "}
                        {selectedAssignments?.length} offers
                    </div>
                    <div className="mb-3">
                        <MultiWithdrawOfferConfirmationTable />
                    </div>
                    Are you sure?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => {
                            setDdahDeletionConfirmationVisible(false);
                        }}
                        variant="light"
                    >
                        Cancel
                    </Button>
                    <Button onClick={withdrawOffers}>Withdraw</Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
}
export const ConnectedOfferActionButtons = connect(
    (state) => {
        // pass in the currently selected assignments.
        const { selectedAssignmentIds } = offerTableSelector(state);
        const assignments = assignmentsSelector(state);
        return {
            assignments: assignments.filter((x) =>
                selectedAssignmentIds.includes(x.id)
            ),
        };
    },
    {
        offerForAssignmentCreate,
        offerForAssignmentEmail,
        offerForAssignmentNag,
        offerForAssignmentWithdraw,
        setOfferForAssignmentAccepted,
        setOfferForAssignmentRejected,
    }
)(OfferActionButtons);
