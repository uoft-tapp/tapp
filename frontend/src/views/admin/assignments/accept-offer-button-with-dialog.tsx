import React from "react";
import { ActionButton } from "../../../components/action-buttons";
import { OfferConfirmationDialog } from "./offer-confirmation-dialog";
import { Assignment } from "../../../api/defs/types";
import { FaCheck } from "react-icons/fa";

export function AcceptOfferButtonWithDialog(props: {
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
                icon={<FaCheck />}
                onClick={props.actionButtonOnClick}
                disabled={!props.actionButtonEnable}
            >
                Set as Accepted
            </ActionButton>
            <OfferConfirmationDialog
                data={props.selectedAssignments}
                visible={props.dialogVisible}
                setVisible={props.dialogSetVisible}
                callback={props.actionCallback}
                title="Accepting Multiple Offers"
                body={`You are accepting the following ${props.selectedAssignments.length} offers:`}
                confirmation={`Accept ${props.selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}
