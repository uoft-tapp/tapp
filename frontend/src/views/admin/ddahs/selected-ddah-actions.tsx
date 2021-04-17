import React from "react";
import { FaCheck, FaMailBulk, FaTrash } from "react-icons/fa";
import { Ddah } from "../../../api/defs/types";
import { ActionButton } from "../../../components/action-buttons";
import { DdahConfirmationDialog } from "./ddah-confirmation-dialog";

type ButtonWithDialogProps = {
    disabled?: boolean;
    selectedDdahs: Ddah[];
    callback: Function;
};

export function EmailDdahsButtonWithDialog({
    disabled = false,
    selectedDdahs,
    callback,
}: ButtonWithDialogProps) {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    function confirmOfferCreate() {
        if (selectedDdahs?.length > 1) {
            setShowConfirmation(true);
        } else {
            callback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={FaMailBulk}
                onClick={confirmOfferCreate}
                disabled={disabled}
            >
                Email DDAH
            </ActionButton>
            <DdahConfirmationDialog
                selectedDdahs={selectedDdahs}
                visible={showConfirmation}
                setVisible={setShowConfirmation}
                callback={callback}
                title="Emailing Multiple DDAHs"
                body={`Emailing the following ${selectedDdahs.length} DDAHs.`}
                confirmation={`Email ${selectedDdahs.length} DDAHs`}
            />
        </React.Fragment>
    );
}

export function ApproveDdahsButtonWithDialog({
    disabled = false,
    selectedDdahs,
    callback,
}: ButtonWithDialogProps) {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    function confirmOfferCreate() {
        if (selectedDdahs?.length > 1) {
            setShowConfirmation(true);
        } else {
            callback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={FaCheck}
                onClick={confirmOfferCreate}
                disabled={disabled}
            >
                Approve DDAH
            </ActionButton>
            <DdahConfirmationDialog
                selectedDdahs={selectedDdahs}
                visible={showConfirmation}
                setVisible={setShowConfirmation}
                callback={callback}
                title="Approving Multiple DDAHs"
                body={`Approving the following ${selectedDdahs.length} DDAHs.`}
                confirmation={`Approve ${selectedDdahs.length} DDAHs`}
            />
        </React.Fragment>
    );
}

export function DeleteDdahsButtonWithDialog({
    disabled = false,
    selectedDdahs,
    callback,
}: ButtonWithDialogProps) {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    function confirmOfferCreate() {
        if (selectedDdahs?.length > 1) {
            setShowConfirmation(true);
        } else {
            callback();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={FaTrash}
                onClick={confirmOfferCreate}
                disabled={disabled}
            >
                Delete DDAH
            </ActionButton>
            <DdahConfirmationDialog
                selectedDdahs={selectedDdahs}
                visible={showConfirmation}
                setVisible={setShowConfirmation}
                callback={callback}
                title="Deleting Multiple DDAHs"
                body={`Deleting the following ${selectedDdahs.length} DDAHs.`}
                confirmation={`Delete ${selectedDdahs.length} DDAHs`}
            />
        </React.Fragment>
    );
}
