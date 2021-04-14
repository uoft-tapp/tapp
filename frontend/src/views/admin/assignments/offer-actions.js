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
    CreateOfferButtonWithDialog,
    WithdrawOfferButtonWithDialog,
    EmailOfferButtonWithDialog,
    NagOfferButtonWithDialog,
    AcceptOfferButtonWithDialog,
    RejectOfferButtonWithDialog,
} from "./offer-button-with-dialog";

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

    function createOffers() {
        for (const assignment of selectedAssignments) {
            offerForAssignmentCreate(assignment);
        }
    }

    function withdrawOffers() {
        for (const assignment of selectedAssignments) {
            offerForAssignmentWithdraw(assignment);
        }
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

    return (
        <React.Fragment>
            <CreateOfferButtonWithDialog
                actionButtonEnable={actionPermitted.canCreate}
                selectedAssignments={selectedAssignments}
                actionCallback={createOffers}
            />
            <WithdrawOfferButtonWithDialog
                actionButtonEnable={actionPermitted.canWithdraw}
                selectedAssignments={selectedAssignments}
                actionCallback={withdrawOffers}
            />
            <EmailOfferButtonWithDialog
                actionButtonEnable={actionPermitted.canEmail}
                selectedAssignments={selectedAssignments}
                actionCallback={emailOffers}
            />
            <NagOfferButtonWithDialog
                actionButtonEnable={actionPermitted.canNag}
                selectedAssignments={selectedAssignments}
                actionCallback={nagOffers}
            />
            <AcceptOfferButtonWithDialog
                actionButtonEnable={actionPermitted.canAccept}
                selectedAssignments={selectedAssignments}
                actionCallback={acceptOffers}
            />
            <RejectOfferButtonWithDialog
                actionButtonEnable={actionPermitted.canReject}
                selectedAssignments={selectedAssignments}
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
