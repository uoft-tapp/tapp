import React from "react";
import { ActionButton } from "../../../components/action-buttons";
import { OfferConfirmationDialog } from "./offer-confirmation-dialog";
import { Assignment } from "../../../api/defs/types";
import { FaUserPlus } from "react-icons/fa";

export function CreateOfferButtonWithDialog(props: {
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
                icon={<FaUserPlus />}
                onClick={props.actionButtonOnClick}
                disabled={!props.actionButtonEnable}
            >
                Create Offer
            </ActionButton>
            <OfferConfirmationDialog
                data={props.selectedAssignments}
                visible={props.dialogVisible}
                setVisible={props.dialogSetVisible}
                callback={props.actionCallback}
                title="Creating Multiple Offers"
                body={`You are creating the following ${props.selectedAssignments.length} offers:`}
                confirmation={`Create ${props.selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}
