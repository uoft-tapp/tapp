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
import { CreateOfferButtonWithDialog } from "./create-offer-button-with-dialog";
import { WithdrawOfferButtonWithDialog } from "./withdraw-offer-button-with-dialog";
import { EmailOfferButtonWithDialog } from "./email-offer-button-with-dialog";
import { NagOfferButtonWithDialog } from "./nag-offer-button-with-dialog";
import { AcceptOfferButtonWithDialog } from "./accept-offer-button-with-dialog";
import { RejectOfferButtonWithDialog } from "./reject-offer-button-with-dialog";

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
            <CreateOfferButtonWithDialog
                actionButtonEnable={actionPermitted.canCreate}
                actionButtonOnClick={confirmOfferCreate}
                selectedAssignments={selectedAssignments}
                dialogVisible={showCreateConfirmation}
                dialogSetVisible={setShowCreateConfirmation}
                actionCallback={createOffers}
            />
            <WithdrawOfferButtonWithDialog
                actionButtonEnable={actionPermitted.canWithdraw}
                actionButtonOnClick={confirmOfferWithdraw}
                selectedAssignments={selectedAssignments}
                dialogVisible={showWithdrawConfirmation}
                dialogSetVisible={setShowWithdrawConfirmation}
                actionCallback={withdrawOffers}
            />
            <EmailOfferButtonWithDialog
                actionButtonEnable={actionPermitted.canEmail}
                actionButtonOnClick={confirmOfferEmail}
                selectedAssignments={selectedAssignments}
                dialogVisible={showEmailConfirmation}
                dialogSetVisible={setShowEmailConfirmation}
                actionCallback={emailOffers}
            />
            <NagOfferButtonWithDialog
                actionButtonEnable={actionPermitted.canNag}
                actionButtonOnClick={confirmOfferNag}
                selectedAssignments={selectedAssignments}
                dialogVisible={showNagConfirmation}
                dialogSetVisible={setShowNagConfirmation}
                actionCallback={nagOffers}
            />
            <AcceptOfferButtonWithDialog
                actionButtonEnable={actionPermitted.canAccept}
                actionButtonOnClick={confirmOfferAccept}
                selectedAssignments={selectedAssignments}
                dialogVisible={showAcceptConfirmation}
                dialogSetVisible={setShowAcceptConfirmation}
                actionCallback={acceptOffers}
            />
            <RejectOfferButtonWithDialog
                actionButtonEnable={actionPermitted.canReject}
                actionButtonOnClick={confirmOfferReject}
                selectedAssignments={selectedAssignments}
                dialogVisible={showRejectConfirmation}
                dialogSetVisible={setShowRejectConfirmation}
                actionCallback={rejectOffers}
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
