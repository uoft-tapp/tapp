import React from "react";
import { connect } from "react-redux";
import { offerTableSelector } from "../offertable/actions";
import { assignmentsSelector } from "../../../api/actions";
import {
    offerForAssignmentCreate,
    offerForAssignmentEmail,
    offerForAssignmentNag,
    offerForAssignmentWithdraw,
    setOfferForAssignmentAccepted,
    setOfferForAssignmentRejected,
} from "../../../api/actions";
import {
    FaEnvelope,
    FaBan,
    FaCheck,
    FaUserTimes,
    FaUserClock,
    FaUserPlus,
} from "react-icons/fa";
import { ActionButton } from "../../../components/action-buttons";
import { MultiManipulateOfferConfirmation } from "./manipulate-assignment-confirmation";

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
        return (
            assignment.active_offer_status != null &&
            assignment.active_offer_status !== "withdrawn" &&
            assignment.active_offer_status !== "rejected"
        );
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

    const [showCreateConfirmation, setShowCreateConfirmation] = React.useState(
        false
    );
    const [
        showWithdrawConfirmation,
        setShowWithdrawConfirmation,
    ] = React.useState(false);
    const [showEmailConfirmation, setShowEmailConfirmation] = React.useState(
        false
    );
    const [showNagConfirmation, setShowNagConfirmation] = React.useState(false);
    const [showAcceptConfirmation, setShowAcceptConfirmation] = React.useState(
        false
    );
    const [showRejectConfirmation, setShowRejectConfirmation] = React.useState(
        false
    );

    function confirmOfferCreate() {
        if (selectedAssignments?.length > 1) {
            setShowCreateConfirmation(true);
        } else {
            createOffers();
        }
    }
    function createOffers() {
        for (const assignment of selectedAssignments) {
            offerForAssignmentCreate(assignment);
        }
    }

    function confirmOfferWithdraw() {
        if (selectedAssignments?.length > 1) {
            setShowWithdrawConfirmation(true);
        } else {
            withdrawOffers();
        }
    }
    function withdrawOffers() {
        for (const assignment of selectedAssignments) {
            offerForAssignmentWithdraw(assignment);
        }
    }

    function confirmOfferEmail() {
        if (selectedAssignments?.length > 1) {
            setShowEmailConfirmation(true);
        } else {
            emailOffers();
        }
    }
    function emailOffers() {
        for (const assignment of selectedAssignments) {
            offerForAssignmentEmail(assignment);
        }
    }

    function confirmOfferNag() {
        if (selectedAssignments?.length > 1) {
            setShowNagConfirmation(true);
        } else {
            nagOffers();
        }
    }
    function nagOffers() {
        for (const assignment of selectedAssignments) {
            offerForAssignmentNag(assignment);
        }
    }

    function confirmOfferAccept() {
        if (selectedAssignments?.length > 1) {
            setShowAcceptConfirmation(true);
        } else {
            acceptOffers();
        }
    }
    function acceptOffers() {
        for (const assignment of selectedAssignments) {
            setOfferForAssignmentAccepted(assignment);
        }
    }

    function confirmOfferReject() {
        if (selectedAssignments?.length > 1) {
            setShowRejectConfirmation(true);
        } else {
            rejectOffers();
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

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaUserPlus />}
                onClick={confirmOfferCreate}
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
                onClick={confirmOfferEmail}
                disabled={!actionPermitted.canEmail}
            >
                Email Offer
            </ActionButton>
            <ActionButton
                icon={<FaUserClock />}
                onClick={confirmOfferNag}
                disabled={!actionPermitted.canNag}
            >
                Nag Offer
            </ActionButton>
            <ActionButton
                icon={<FaCheck />}
                onClick={confirmOfferAccept}
                disabled={!actionPermitted.canAccept}
            >
                Set as Accepted
            </ActionButton>
            <ActionButton
                icon={<FaBan />}
                onClick={confirmOfferReject}
                disabled={!actionPermitted.canReject}
            >
                Set as Rejected
            </ActionButton>
            <MultiManipulateOfferConfirmation
                data={selectedAssignments}
                visible={showCreateConfirmation}
                setVisible={setShowCreateConfirmation}
                manipulateOffers={createOffers}
                titleMsg="Creating Multiple Offers"
                alertMsg={`You are creating the following ${selectedAssignments.length} offers:`}
                confirmBtnMsg={`Create ${selectedAssignments.length} Offers`}
            />
            <MultiManipulateOfferConfirmation
                data={selectedAssignments}
                visible={showWithdrawConfirmation}
                setVisible={setShowWithdrawConfirmation}
                manipulateOffers={withdrawOffers}
                titleMsg="Withdrawing Multiple Offers"
                alertMsg={`You are withdrawing from the following ${selectedAssignments.length} offers:`}
                confirmBtnMsg={`Withdraw ${selectedAssignments.length} Offers`}
            />
            <MultiManipulateOfferConfirmation
                data={selectedAssignments}
                visible={showEmailConfirmation}
                setVisible={setShowEmailConfirmation}
                manipulateOffers={emailOffers}
                titleMsg="Emailing Multiple Offers"
                alertMsg={`You are emailing the following ${selectedAssignments.length} offers:`}
                confirmBtnMsg={`Email ${selectedAssignments.length} Offers`}
            />
            <MultiManipulateOfferConfirmation
                data={selectedAssignments}
                visible={showNagConfirmation}
                setVisible={setShowNagConfirmation}
                manipulateOffers={nagOffers}
                titleMsg="Nagging Multiple Offers"
                alertMsg={`You are nagging the following ${selectedAssignments.length} offers:`}
                confirmBtnMsg={`Nag ${selectedAssignments.length} Offers`}
            />
            <MultiManipulateOfferConfirmation
                data={selectedAssignments}
                visible={showAcceptConfirmation}
                setVisible={setShowAcceptConfirmation}
                manipulateOffers={acceptOffers}
                titleMsg="Accepting Multiple Offers"
                alertMsg={`You are accepting the following ${selectedAssignments.length} offers:`}
                confirmBtnMsg={`Accept ${selectedAssignments.length} Offers`}
            />
            <MultiManipulateOfferConfirmation
                data={selectedAssignments}
                visible={showRejectConfirmation}
                setVisible={setShowRejectConfirmation}
                manipulateOffers={rejectOffers}
                titleMsg="Rejecting Multiple Offers"
                alertMsg={`You are rejecting the following ${selectedAssignments.length} offers:`}
                confirmBtnMsg={`Reject ${selectedAssignments.length} Offers`}
            />
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
