import React from "react";
import { connect } from "react-redux";
import { offerTableSelector } from "../offertable/actions";
import { assignmentsSelector } from "../../api/actions";
import {
    offerForAssignmentCreate,
    offerForAssignmentEmail,
    offerForAssignmentNag,
    offerForAssignmentWithdraw,
    setOfferForAssignmentAccepted,
    setOfferForAssignmentRejected,
} from "../../api/actions/offers";
import {
    FaEnvelope,
    FaBan,
    FaCheck,
    FaUserTimes,
    FaUserClock,
    FaUserPlus,
} from "react-icons/fa";
import { ActionButton } from "../../components/action-buttons";

/**
 * Functions to test what actions you can do with a particular assignment
 */
const OfferTest = {
    canCreate(assignment) {
        return assignment.active_offer_status == null;
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
            <ActionButton
                icon={<FaUserPlus />}
                onClick={createOffers}
                disabled={!actionPermitted.canCreate}
            >
                Create Offer
            </ActionButton>
            <ActionButton
                icon={<FaUserTimes />}
                onClick={withdrawOffers}
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
