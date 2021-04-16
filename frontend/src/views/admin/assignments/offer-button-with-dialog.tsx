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
    disabled?: boolean;
    selectedAssignments: Assignment[];
    callback: Function;
};

export function CreateOfferButtonWithDialog({
    disabled = false,
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
                disabled={disabled}
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
    disabled = false,
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
                disabled={disabled}
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
    disabled = false,
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
                disabled={disabled}
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
    disabled = false,
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
                disabled={disabled}
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
    disabled = false,
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
                disabled={disabled}
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
    disabled = false,
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
                disabled={disabled}
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
