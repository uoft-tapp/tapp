import React from "react";
import { ActionButton } from "../../../components/action-buttons";
import { OfferConfirmationDialog } from "./offer-confirmation-dialog";
import { Assignment } from "../../../api/defs/types";
import { FaEnvelope } from "react-icons/fa";

export function EmailOfferButtonWithDialog(props: {
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
                icon={<FaEnvelope />}
                onClick={props.actionButtonOnClick}
                disabled={!props.actionButtonEnable}
            >
                Email Offer
            </ActionButton>
            <OfferConfirmationDialog
                data={props.selectedAssignments}
                visible={props.dialogVisible}
                setVisible={props.dialogSetVisible}
                callback={props.actionCallback}
                title="Emailing Multiple Offers"
                body={`You are emailing the following ${props.selectedAssignments.length} offers:`}
                confirmation={`Email ${props.selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}
