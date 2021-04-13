import React from "react";
import { ActionButton } from "../../../components/action-buttons";
import { OfferConfirmationDialog } from "./offer-confirmation-dialog";
import { Assignment } from "../../../api/defs/types";

export function ConfirmWithDialogActionButton(props: {
    buttonIcon: Object;
    buttonEnable: boolean;
    actionConfirmation: () => void;
    buttonText: string;
    selectedAssignments: Assignment[];
    dialogVisible: boolean;
    dialogSetVisible: Function;
    actionCallback: Function;
    dialogTitle: string;
    dialogBody: string;
    dialogConfirmation: string;
}) {
    const {
        buttonIcon,
        buttonEnable,
        actionConfirmation,
        buttonText,
        selectedAssignments,
        dialogVisible,
        dialogSetVisible,
        actionCallback,
        dialogTitle,
        dialogBody,
        dialogConfirmation,
    } = props;
    return (
        <React.Fragment>
            <ActionButton
                icon={buttonIcon}
                onClick={actionConfirmation}
                disabled={!buttonEnable}
            >
                {buttonText}
            </ActionButton>
            <OfferConfirmationDialog
                data={selectedAssignments}
                visible={dialogVisible}
                setVisible={dialogSetVisible}
                callback={actionCallback}
                title={dialogTitle}
                body={dialogBody}
                confirmation={dialogConfirmation}
            />
        </React.Fragment>
    );
}
