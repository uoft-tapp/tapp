import React from "react";
import { ActionButton } from "../../../components/action-buttons";
import { OfferConfirmationDialog } from "./offer-confirmation-dialog";
import { Assignment } from "../../../api/defs/types";
import { FaUserClock } from "react-icons/fa";

export function NagOfferButtonWithDialog(props: {
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
                icon={<FaUserClock />}
                onClick={props.actionButtonOnClick}
                disabled={!props.actionButtonEnable}
            >
                Nag Offer
            </ActionButton>
            <OfferConfirmationDialog
                data={props.selectedAssignments}
                visible={props.dialogVisible}
                setVisible={props.dialogSetVisible}
                callback={props.actionCallback}
                title="Nagging Multiple Offers"
                body={`You are nagging the following ${props.selectedAssignments.length} offers:`}
                confirmation={`Nag ${props.selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}
