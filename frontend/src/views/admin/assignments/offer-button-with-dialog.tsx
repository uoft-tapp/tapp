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
    actionButtonDisable?: boolean;
    selectedAssignments: Assignment[];
    callback: Function;
};

export function CreateOfferButtonWithDialog({
    actionButtonDisable = true,
    selectedAssignments,
    callback,
}: ButtonWithDialogProps) {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    function confirmOfferCreate() {
        if (selectedAssignments?.length > 1) {
            setShowConfirmation(true);
        } else {
            callback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaUserPlus />}
                onClick={confirmOfferCreate}
                disabled={actionButtonDisable}
            >
                Create Offer
            </ActionButton>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={showConfirmation}
                setVisible={setShowConfirmation}
                callback={callback}
                title="Creating Multiple Offers"
                body={`You are creating the following ${selectedAssignments.length} offers.`}
                confirmation={`Create ${selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}

export function WithdrawOfferButtonWithDialog({
    actionButtonDisable = true,
    selectedAssignments,
    callback,
}: ButtonWithDialogProps) {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    function confirmOfferWithdraw() {
        if (selectedAssignments?.length > 1) {
            setShowConfirmation(true);
        } else {
            callback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaUserTimes />}
                onClick={confirmOfferWithdraw}
                disabled={actionButtonDisable}
            >
                Withdraw Offer
            </ActionButton>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={showConfirmation}
                setVisible={setShowConfirmation}
                callback={callback}
                title="Withdrawing Multiple Offers"
                body={`You are withdrawing from the following ${selectedAssignments.length} offers.`}
                confirmation={`Withdraw ${selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}

export function EmailOfferButtonWithDialog({
    actionButtonDisable = true,
    selectedAssignments,
    callback,
}: ButtonWithDialogProps) {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    function confirmOfferEmail() {
        if (selectedAssignments?.length > 1) {
            setShowConfirmation(true);
        } else {
            callback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaEnvelope />}
                onClick={confirmOfferEmail}
                disabled={actionButtonDisable}
            >
                Email Offer
            </ActionButton>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={showConfirmation}
                setVisible={setShowConfirmation}
                callback={callback}
                title="Emailing Multiple Offers"
                body={`You are emailing the following ${selectedAssignments.length} offers.`}
                confirmation={`Email ${selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}

export function NagOfferButtonWithDialog({
    actionButtonDisable = true,
    selectedAssignments,
    callback,
}: ButtonWithDialogProps) {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    function confirmOfferNag() {
        if (selectedAssignments?.length > 1) {
            setShowConfirmation(true);
        } else {
            callback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaUserClock />}
                onClick={confirmOfferNag}
                disabled={actionButtonDisable}
            >
                Nag Offer
            </ActionButton>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={showConfirmation}
                setVisible={setShowConfirmation}
                callback={callback}
                title="Nagging Multiple Offers"
                body={`You are nagging the following ${selectedAssignments.length} offers.`}
                confirmation={`Nag ${selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}

export function AcceptOfferButtonWithDialog({
    actionButtonDisable = true,
    selectedAssignments,
    callback,
}: ButtonWithDialogProps) {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    function confirmOfferAccept() {
        if (selectedAssignments?.length > 1) {
            setShowConfirmation(true);
        } else {
            callback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaCheck />}
                onClick={confirmOfferAccept}
                disabled={actionButtonDisable}
            >
                Set as Accepted
            </ActionButton>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={showConfirmation}
                setVisible={setShowConfirmation}
                callback={callback}
                title="Accepting Multiple Offers"
                body={`You are accepting the following ${selectedAssignments.length} offers.`}
                confirmation={`Accept ${selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}

export function RejectOfferButtonWithDialog({
    actionButtonDisable = true,
    selectedAssignments,
    callback,
}: ButtonWithDialogProps) {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    function confirmOfferReject() {
        if (selectedAssignments?.length > 1) {
            setShowConfirmation(true);
        } else {
            callback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={<FaBan />}
                onClick={confirmOfferReject}
                disabled={actionButtonDisable}
            >
                Set as Rejected
            </ActionButton>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={showConfirmation}
                setVisible={setShowConfirmation}
                callback={callback}
                title="Rejecting Multiple Offers"
                body={`You are rejecting the following ${selectedAssignments.length} offers.`}
                confirmation={`Reject ${selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}
