import React from "react";
import { ActionButton } from "../../../components/action-buttons";
import { OfferConfirmationDialog } from "./offer-confirmation-dialog";
import { Assignment } from "../../../api/defs/types";
import { FaBan } from "react-icons/fa";

export function RejectOfferButtonWithDialog(props: {
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
                icon={<FaBan />}
                onClick={props.actionButtonOnClick}
                disabled={!props.actionButtonEnable}
            >
                Set as Rejected
            </ActionButton>
            <OfferConfirmationDialog
                data={props.selectedAssignments}
                visible={props.dialogVisible}
                setVisible={props.dialogSetVisible}
                callback={props.actionCallback}
                title="Rejecting Multiple Offers"
                body={`You are rejecting the following ${props.selectedAssignments.length} offers:`}
                confirmation={`Reject ${props.selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}
