import React from "react";
import { OfferConfirmationDialog } from "./offer-confirmation-dialog";
import { Assignment } from "../../../api/defs/types";

export function ActionConfirmationDialogs(props: {
    selectedAssignments: Assignment[];
    actionCallback: { [Key: string]: () => void };
    dialogVisible: { [Key: string]: boolean };
    dialogSetVisible: { [Key: string]: () => void };
}) {
    const {
        selectedAssignments,
        actionCallback,
        dialogVisible,
        dialogSetVisible,
    } = props;
    return (
        <React.Fragment>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={dialogVisible.create}
                setVisible={dialogSetVisible.create}
                callback={actionCallback.create}
                title="Creating Multiple Offers"
                body={`You are creating the following ${selectedAssignments.length} offers:`}
                confirmation={`Create ${selectedAssignments.length} Offers`}
            />
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={dialogVisible.withdraw}
                setVisible={dialogSetVisible.withdraw}
                callback={actionCallback.withdraw}
                title="Withdrawing Multiple Offers"
                body={`You are withdrawing from the following ${selectedAssignments.length} offers:`}
                confirmation={`Withdraw ${selectedAssignments.length} Offers`}
            />
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={dialogVisible.email}
                setVisible={dialogSetVisible.email}
                callback={actionCallback.email}
                title="Emailing Multiple Offers"
                body={`You are emailing the following ${selectedAssignments.length} offers:`}
                confirmation={`Email ${selectedAssignments.length} Offers`}
            />
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={dialogVisible.nag}
                setVisible={dialogSetVisible.nag}
                callback={actionCallback.nag}
                title="Nagging Multiple Offers"
                body={`You are nagging the following ${selectedAssignments.length} offers:`}
                confirmation={`Nag ${selectedAssignments.length} Offers`}
            />
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={dialogVisible.accept}
                setVisible={dialogSetVisible.accept}
                callback={actionCallback.accept}
                title="Accepting Multiple Offers"
                body={`You are accepting the following ${selectedAssignments.length} offers:`}
                confirmation={`Accept ${selectedAssignments.length} Offers`}
            />
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={dialogVisible.reject}
                setVisible={dialogSetVisible.reject}
                callback={actionCallback.reject}
                title="Rejecting Multiple Offers"
                body={`You are rejecting the following ${selectedAssignments.length} offers:`}
                confirmation={`Reject ${selectedAssignments.length} Offers`}
            />
        </React.Fragment>
    );
}
