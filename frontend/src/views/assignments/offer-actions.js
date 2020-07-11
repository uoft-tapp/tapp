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
    FaPlusCircle,
    FaMinusCircle,
    FaCheckCircle,
    FaExclamationCircle,
    FaTimesCircle,
    FaArrowCircleRight,
} from "react-icons/fa";
import { ActionButton } from "../../components/action-buttons";

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

    return (
        <React.Fragment>
            <ActionButton icon={<FaPlusCircle />} onClick={createOffers}>
                Create Offer
            </ActionButton>
            <ActionButton icon={<FaMinusCircle />} onClick={withdrawOffers}>
                Withdraw Offer
            </ActionButton>
            <ActionButton icon={<FaArrowCircleRight />} onClick={emailOffers}>
                Email Offer
            </ActionButton>
            <ActionButton icon={<FaExclamationCircle />} onClick={nagOffers}>
                Nag Offer
            </ActionButton>
            <ActionButton icon={<FaCheckCircle />} onClick={acceptOffers}>
                Set as Accepted
            </ActionButton>
            <ActionButton icon={<FaTimesCircle />} onClick={rejectOffers}>
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
