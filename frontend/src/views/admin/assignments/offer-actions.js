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

    async function createOffers() {
        for (const assignment of selectedAssignments) {
            await offerForAssignmentCreate(assignment);
        }
    }

    async function withdrawOffers() {
        for (const assignment of selectedAssignments) {
            await offerForAssignmentWithdraw(assignment);
        }
    }

    async function emailOffers() {
        for (const assignment of selectedAssignments) {
            await offerForAssignmentEmail(assignment);
        }
    }

    async function nagOffers() {
        for (const assignment of selectedAssignments) {
            await offerForAssignmentNag(assignment);
        }
    }

    async function acceptOffers() {
        for (const assignment of selectedAssignments) {
            await setOfferForAssignmentAccepted(assignment);
        }
    }

    async function rejectOffers() {
        for (const assignment of selectedAssignments) {
            await setOfferForAssignmentRejected(assignment);
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
                actionButtonDisable={!actionPermitted.canCreate}
                selectedAssignments={selectedAssignments}
                callback={createOffers}
            />
            <WithdrawOfferButtonWithDialog
                actionButtonDisable={!actionPermitted.canWithdraw}
                selectedAssignments={selectedAssignments}
                callback={withdrawOffers}
            />
            <EmailOfferButtonWithDialog
                actionButtonDisable={!actionPermitted.canEmail}
                selectedAssignments={selectedAssignments}
                callback={emailOffers}
            />
            <NagOfferButtonWithDialog
                actionButtonDisable={!actionPermitted.canNag}
                selectedAssignments={selectedAssignments}
                callback={nagOffers}
            />
            <AcceptOfferButtonWithDialog
                actionButtonDisable={!actionPermitted.canAccept}
                selectedAssignments={selectedAssignments}
                callback={acceptOffers}
            />
            <RejectOfferButtonWithDialog
                actionButtonDisable={!actionPermitted.canReject}
                selectedAssignments={selectedAssignments}
                callback={rejectOffers}
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
