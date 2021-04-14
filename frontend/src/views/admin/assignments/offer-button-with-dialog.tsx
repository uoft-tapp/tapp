import React from "react";
import { ActionButton } from "../../../components/action-buttons";
import { OfferConfirmationDialog } from "./offer-confirmation-dialog";
import { Assignment } from "../../../api/defs/types";
import {
    FaCheck,
    FaUserPlus,
    FaUserTimes,
    FaEnvelope,
    FaUserClock,
    FaBan,
} from "react-icons/fa";

type ButtonWithDialogProps = {
    actionButtonEnable: boolean;
    selectedAssignments: Assignment[];
    actionCallback: Function;
};

export function CreateOfferButtonWithDialog({
    actionButtonEnable,
    selectedAssignments,
    actionCallback,
}: ButtonWithDialogProps) {
    const [showCreateConfirmation, setShowCreateConfirmation] = React.useState(
        false
    );

    function confirmOfferCreate() {
        if (selectedAssignments?.length > 1) {
            setShowCreateConfirmation(true);
        } else {
            actionCallback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaUserPlus />}
                onClick={confirmOfferCreate}
                disabled={!actionButtonEnable}
            >
                Create Offer
            </ActionButton>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={showCreateConfirmation}
                setVisible={setShowCreateConfirmation}
                callback={actionCallback}
                title="Creating Multiple Offers"
                body={`You are creating the following ${selectedAssignments.length} offers:`}
                confirmation={`Create ${selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}

export function WithdrawOfferButtonWithDialog({
    actionButtonEnable,
    selectedAssignments,
    actionCallback,
}: ButtonWithDialogProps) {
    const [
        showWithdrawConfirmation,
        setShowWithdrawConfirmation,
    ] = React.useState(false);

    function confirmOfferWithdraw() {
        if (selectedAssignments?.length > 1) {
            setShowWithdrawConfirmation(true);
        } else {
            actionCallback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaUserTimes />}
                onClick={confirmOfferWithdraw}
                disabled={!actionButtonEnable}
            >
                Withdraw Offer
            </ActionButton>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={showWithdrawConfirmation}
                setVisible={setShowWithdrawConfirmation}
                callback={actionCallback}
                title="Withdrawing Multiple Offers"
                body={`You are withdrawing from the following ${selectedAssignments.length} offers:`}
                confirmation={`Withdraw ${selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}

export function EmailOfferButtonWithDialog({
    actionButtonEnable,
    selectedAssignments,
    actionCallback,
}: ButtonWithDialogProps) {
    const [showEmailConfirmation, setShowEmailConfirmation] = React.useState(
        false
    );

    function confirmOfferEmail() {
        if (selectedAssignments?.length > 1) {
            setShowEmailConfirmation(true);
        } else {
            actionCallback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaEnvelope />}
                onClick={confirmOfferEmail}
                disabled={!actionButtonEnable}
            >
                Email Offer
            </ActionButton>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={showEmailConfirmation}
                setVisible={setShowEmailConfirmation}
                callback={actionCallback}
                title="Emailing Multiple Offers"
                body={`You are emailing the following ${selectedAssignments.length} offers:`}
                confirmation={`Email ${selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}

export function NagOfferButtonWithDialog({
    actionButtonEnable,
    selectedAssignments,
    actionCallback,
}: ButtonWithDialogProps) {
    const [showNagConfirmation, setShowNagConfirmation] = React.useState(false);

    function confirmOfferNag() {
        if (selectedAssignments?.length > 1) {
            setShowNagConfirmation(true);
        } else {
            actionCallback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaUserClock />}
                onClick={confirmOfferNag}
                disabled={!actionButtonEnable}
            >
                Nag Offer
            </ActionButton>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={showNagConfirmation}
                setVisible={setShowNagConfirmation}
                callback={actionCallback}
                title="Nagging Multiple Offers"
                body={`You are nagging the following ${selectedAssignments.length} offers:`}
                confirmation={`Nag ${selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}

export function AcceptOfferButtonWithDialog({
    actionButtonEnable,
    selectedAssignments,
    actionCallback,
}: ButtonWithDialogProps) {
    const [showAcceptConfirmation, setShowAcceptConfirmation] = React.useState(
        false
    );

    function confirmOfferAccept() {
        if (selectedAssignments?.length > 1) {
            setShowAcceptConfirmation(true);
        } else {
            actionCallback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaCheck />}
                onClick={confirmOfferAccept}
                disabled={!actionButtonEnable}
            >
                Set as Accepted
            </ActionButton>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={showAcceptConfirmation}
                setVisible={setShowAcceptConfirmation}
                callback={actionCallback}
                title="Accepting Multiple Offers"
                body={`You are accepting the following ${selectedAssignments.length} offers:`}
                confirmation={`Accept ${selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}

export function RejectOfferButtonWithDialog({
    actionButtonEnable,
    selectedAssignments,
    actionCallback,
}: ButtonWithDialogProps) {
    const [showRejectConfirmation, setShowRejectConfirmation] = React.useState(
        false
    );

    function confirmOfferReject() {
        if (selectedAssignments?.length > 1) {
            setShowRejectConfirmation(true);
        } else {
            actionCallback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaBan />}
                onClick={confirmOfferReject}
                disabled={!actionButtonEnable}
            >
                Set as Rejected
            </ActionButton>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={showRejectConfirmation}
                setVisible={setShowRejectConfirmation}
                callback={actionCallback}
                title="Rejecting Multiple Offers"
                body={`You are rejecting the following ${selectedAssignments.length} offers:`}
                confirmation={`Reject ${selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}
