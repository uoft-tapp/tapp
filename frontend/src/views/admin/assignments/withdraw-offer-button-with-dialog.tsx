import React from "react";
import { ActionButton } from "../../../components/action-buttons";
import { OfferConfirmationDialog } from "./offer-confirmation-dialog";
import { Assignment } from "../../../api/defs/types";
import { FaUserTimes } from "react-icons/fa";

export function WithdrawOfferButtonWithDialog(props: {
    actionButtonEnable: boolean;
    actionButtonOnClick: () => void;
    selectedAssignments: Assignment[];
    dialogVisible: boolean;
    dialogSetVisible: Function;
    actionCallback: Function;
}) {
    return (
        <React.Fragment>
            <ActionButton
                icon={<FaUserTimes />}
                onClick={props.actionButtonOnClick}
                disabled={!props.actionButtonEnable}
            >
                Withdraw Offer
            </ActionButton>
            <OfferConfirmationDialog
                data={props.selectedAssignments}
                visible={props.dialogVisible}
                setVisible={props.dialogSetVisible}
                callback={props.actionCallback}
                title="Withdrawing Multiple Offers"
                body={`You are withdrawing from the following ${props.selectedAssignments.length} offers:`}
                confirmation={`Withdraw ${props.selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}
