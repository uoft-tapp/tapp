import React from "react";
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
import { Assignment } from "../../../api/defs/types";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

/**
 * Functions to test what actions you can do with a particular assignment
 */
const OfferTest = {
    canCreate(assignment: Assignment) {
        return (
            assignment.active_offer_status == null ||
            assignment.active_offer_status === "withdrawn"
        );
    },
    canEmail(assignment: Assignment) {
        return (
            assignment.active_offer_status != null &&
            assignment.active_offer_status !== "withdrawn" &&
            assignment.active_offer_status !== "rejected"
        );
    },
    canNag(assignment: Assignment) {
        return assignment.active_offer_status === "pending";
    },
    canWithdraw(assignment: Assignment) {
        return assignment.active_offer_status != null;
    },
    canAccept(assignment: Assignment) {
        return assignment.active_offer_status != null;
    },
    canReject(assignment: Assignment) {
        return assignment.active_offer_status != null;
    },
};

export function ConnectedOfferActionButtons({
    selectedAssignments,
}: {
    selectedAssignments: Assignment[];
}) {
    const dispatch = useThunkDispatch();

    function createOffers() {
        return Promise.all(
            selectedAssignments.map((assignment: Assignment) =>
                dispatch(offerForAssignmentCreate(assignment))
            )
        );
    }

    function withdrawOffers() {
        return Promise.all(
            selectedAssignments.map((assignment: Assignment) =>
                dispatch(offerForAssignmentWithdraw(assignment))
            )
        );
    }

    function emailOffers() {
        return Promise.all(
            selectedAssignments.map((assignment: Assignment) =>
                dispatch(offerForAssignmentEmail(assignment))
            )
        );
    }

    function nagOffers() {
        return Promise.all(
            selectedAssignments.map((assignment: Assignment) =>
                dispatch(offerForAssignmentNag(assignment))
            )
        );
    }

    function acceptOffers() {
        return Promise.all(
            selectedAssignments.map((assignment: Assignment) =>
                dispatch(setOfferForAssignmentAccepted(assignment))
            )
        );
    }

    function rejectOffers() {
        return Promise.all(
            selectedAssignments.map((assignment: Assignment) =>
                dispatch(setOfferForAssignmentRejected(assignment))
            )
        );
    }

    const actionPermitted: Partial<
        Record<keyof typeof OfferTest, boolean>
    > = {};
    for (const key of Object.keys(OfferTest) as (keyof typeof OfferTest)[]) {
        actionPermitted[key] =
            selectedAssignments.length !== 0 &&
            selectedAssignments.every(OfferTest[key]);
    }

    return (
        <React.Fragment>
            <CreateOfferButtonWithDialog
                disabled={!actionPermitted.canCreate}
                selectedAssignments={selectedAssignments}
                callback={createOffers}
            />
            <WithdrawOfferButtonWithDialog
                disabled={!actionPermitted.canWithdraw}
                selectedAssignments={selectedAssignments}
                callback={withdrawOffers}
            />
            <EmailOfferButtonWithDialog
                disabled={!actionPermitted.canEmail}
                selectedAssignments={selectedAssignments}
                callback={emailOffers}
            />
            <NagOfferButtonWithDialog
                disabled={!actionPermitted.canNag}
                selectedAssignments={selectedAssignments}
                callback={nagOffers}
            />
            <AcceptOfferButtonWithDialog
                disabled={!actionPermitted.canAccept}
                selectedAssignments={selectedAssignments}
                callback={acceptOffers}
            />
            <RejectOfferButtonWithDialog
                disabled={!actionPermitted.canReject}
                selectedAssignments={selectedAssignments}
                callback={rejectOffers}
            />
        </React.Fragment>
    );
}
