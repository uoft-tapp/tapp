import React from "react";
import {
    FaEnvelope,
    FaBan,
    FaCheck,
    FaUserTimes,
    FaUserClock,
    FaUserPlus,
} from "react-icons/fa";
import { ActionButton } from "../../../components/action-buttons";

export function ActionButtons(props: {
    actionPermitted: { [Key: string]: boolean };
    actionConfirmation: { [Key: string]: () => void };
}) {
    const { actionPermitted, actionConfirmation } = props;
    return (
        <React.Fragment>
            <ActionButton
                icon={<FaUserPlus />}
                onClick={actionConfirmation.create}
                disabled={!actionPermitted.canCreate}
            >
                Create Offer
            </ActionButton>
            <ActionButton
                icon={<FaUserTimes />}
                onClick={actionConfirmation.withdraw}
                disabled={!actionPermitted.canWithdraw}
            >
                Withdraw Offer
            </ActionButton>
            <ActionButton
                icon={<FaEnvelope />}
                onClick={actionConfirmation.email}
                disabled={!actionPermitted.canEmail}
            >
                Email Offer
            </ActionButton>
            <ActionButton
                icon={<FaUserClock />}
                onClick={actionConfirmation.nag}
                disabled={!actionPermitted.canNag}
            >
                Nag Offer
            </ActionButton>
            <ActionButton
                icon={<FaCheck />}
                onClick={actionConfirmation.accept}
                disabled={!actionPermitted.canAccept}
            >
                Set as Accepted
            </ActionButton>
            <ActionButton
                icon={<FaBan />}
                onClick={actionConfirmation.reject}
                disabled={!actionPermitted.canReject}
            >
                Set as Rejected
            </ActionButton>
        </React.Fragment>
    );
}
