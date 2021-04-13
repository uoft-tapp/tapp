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
import { ConfirmWithDialogActionButton } from "./confirm-with-dialog-action-button";

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

function ConfirmWithDialogActionButtons(props) {
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
            <ConfirmWithDialogActionButton
                buttonIcon={<FaUserPlus />}
                actionConfirmation={confirmOfferCreate}
                buttonEnable={actionPermitted.canCreate}
                buttonText="Create Offer"
                selectedAssignments={selectedAssignments}
                dialogVisible={showCreateConfirmation}
                dialogSetVisible={setShowCreateConfirmation}
                actionCallback={createOffers}
                dialogTitle="Creating Multiple Offers"
                dialogBody={`You are creating the following ${selectedAssignments.length} offers:`}
                dialogConfirmation={`Create ${selectedAssignments.length} Offers`}
            />
            <ConfirmWithDialogActionButton
                buttonIcon={<FaUserTimes />}
                actionConfirmation={confirmOfferWithdraw}
                buttonEnable={actionPermitted.canWithdraw}
                buttonText="Withdraw Offer"
                selectedAssignments={selectedAssignments}
                dialogVisible={showWithdrawConfirmation}
                dialogSetVisible={setShowWithdrawConfirmation}
                actionCallback={withdrawOffers}
                dialogTitle="Withdrawing Multiple Offers"
                dialogBody={`You are withdrawing from the following ${selectedAssignments.length} offers:`}
                dialogConfirmation={`Withdraw ${selectedAssignments.length} Offers`}
            />
            <ConfirmWithDialogActionButton
                buttonIcon={<FaEnvelope />}
                actionConfirmation={confirmOfferEmail}
                buttonEnable={actionPermitted.canEmail}
                buttonText="Email Offer"
                selectedAssignments={selectedAssignments}
                dialogVisible={showEmailConfirmation}
                dialogSetVisible={setShowEmailConfirmation}
                actionCallback={emailOffers}
                dialogTitle="Emailing Multiple Offers"
                dialogBody={`You are emailing the following ${selectedAssignments.length} offers:`}
                dialogConfirmation={`Email ${selectedAssignments.length} Offers`}
            />
            <ConfirmWithDialogActionButton
                buttonIcon={<FaUserClock />}
                actionConfirmation={confirmOfferNag}
                buttonEnable={actionPermitted.canNag}
                buttonText="Nag Offer"
                selectedAssignments={selectedAssignments}
                dialogVisible={showNagConfirmation}
                dialogSetVisible={setShowNagConfirmation}
                actionCallback={nagOffers}
                dialogTitle="Nagging Multiple Offers"
                dialogBody={`You are nagging the following ${selectedAssignments.length} offers:`}
                dialogConfirmation={`Nag ${selectedAssignments.length} Offers`}
            />
            <ConfirmWithDialogActionButton
                buttonIcon={<FaCheck />}
                actionConfirmation={confirmOfferAccept}
                buttonEnable={actionPermitted.canAccept}
                buttonText="Set as Accepted"
                selectedAssignments={selectedAssignments}
                dialogVisible={showAcceptConfirmation}
                dialogSetVisible={setShowAcceptConfirmation}
                actionCallback={acceptOffers}
                dialogTitle="Accepting Multiple Offers"
                dialogBody={`You are accepting the following ${selectedAssignments.length} offers:`}
                dialogConfirmation={`Accept ${selectedAssignments.length} Offers`}
            />
            <ConfirmWithDialogActionButton
                buttonIcon={<FaBan />}
                actionConfirmation={confirmOfferReject}
                buttonEnable={actionPermitted.canReject}
                buttonText="Set as Rejected"
                selectedAssignments={selectedAssignments}
                dialogVisible={showRejectConfirmation}
                dialogSetVisible={setShowRejectConfirmation}
                actionCallback={rejectOffers}
                dialogTitle="Reject Multiple Offers"
                dialogBody={`You are rejecting the following ${selectedAssignments.length} offers:`}
                dialogConfirmation={`Reject ${selectedAssignments.length} Offers`}
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
)(ConfirmWithDialogActionButtons);
