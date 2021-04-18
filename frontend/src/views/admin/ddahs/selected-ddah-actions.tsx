import React from "react";
import { FaCheck, FaMailBulk, FaTrash } from "react-icons/fa";
import { approveDdah, deleteDdah, emailDdah } from "../../../api/actions/ddahs";
import { Ddah } from "../../../api/defs/types";
import { ActionButton } from "../../../components/action-buttons";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { DdahConfirmationDialog } from "./ddah-confirmation-dialog";

type ButtonWithDialogProps = {
    selectedDdahs: Ddah[];
};

export function EmailDdahsButtonWithDialog({
    selectedDdahs,
}: ButtonWithDialogProps) {
    const [showConfirmation, setShowConfirmation] = React.useState(false);
    const dispatch = useThunkDispatch();

    function emailDdahs() {
        return Promise.all(
            selectedDdahs.map((ddah) => dispatch(emailDdah(ddah)))
        );
    }

    function confirmOfferCreate() {
        if (selectedDdahs?.length > 1) {
            setShowConfirmation(true);
        } else {
            emailDdahs();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={FaMailBulk}
                onClick={confirmOfferCreate}
                disabled={selectedDdahs.length === 0}
                title={"Email selected DDAHs"}
            >
                Email DDAH
            </ActionButton>
            <DdahConfirmationDialog
                selectedDdahs={selectedDdahs}
                visible={showConfirmation}
                setVisible={setShowConfirmation}
                callback={emailDdahs}
                title="Emailing Multiple DDAHs"
                body={`Emailing the following ${selectedDdahs.length} DDAHs.`}
                confirmation={`Email ${selectedDdahs.length} DDAHs`}
            />
        </React.Fragment>
    );
}

export function ApproveDdahsButtonWithDialog({
    selectedDdahs,
}: ButtonWithDialogProps) {
    const [showConfirmation, setShowConfirmation] = React.useState(false);
    const dispatch = useThunkDispatch();

    function approveDdahs() {
        return Promise.all(
            selectedDdahs.map((ddah) => dispatch(approveDdah(ddah)))
        );
    }

    function confirmOfferCreate() {
        if (selectedDdahs?.length > 1) {
            setShowConfirmation(true);
        } else {
            approveDdahs();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={FaCheck}
                onClick={confirmOfferCreate}
                disabled={selectedDdahs.length === 0}
                title={"Approve selected DDAHs"}
            >
                Approve DDAH
            </ActionButton>
            <DdahConfirmationDialog
                selectedDdahs={selectedDdahs}
                visible={showConfirmation}
                setVisible={setShowConfirmation}
                callback={approveDdahs}
                title="Approving Multiple DDAHs"
                body={`Approving the following ${selectedDdahs.length} DDAHs.`}
                confirmation={`Approve ${selectedDdahs.length} DDAHs`}
            />
        </React.Fragment>
    );
}

export function DeleteDdahsButtonWithDialog({
    selectedDdahs,
}: ButtonWithDialogProps) {
    const [showConfirmation, setShowConfirmation] = React.useState(false);
    const dispatch = useThunkDispatch();

    function deleteDdahs() {
        return Promise.all(
            selectedDdahs.map((ddah) => dispatch(deleteDdah(ddah)))
        );
    }

    function confirmOfferCreate() {
        if (selectedDdahs?.length > 1) {
            setShowConfirmation(true);
        } else {
            deleteDdahs();
        }
    }

    return (
        <React.Fragment>
            <ActionButton
                icon={FaTrash}
                onClick={confirmOfferCreate}
                disabled={selectedDdahs.length === 0}
                title={"Delete selected DDAHs"}
            >
                Delete DDAH
            </ActionButton>
            <DdahConfirmationDialog
                selectedDdahs={selectedDdahs}
                visible={showConfirmation}
                setVisible={setShowConfirmation}
                callback={deleteDdahs}
                title="Deleting Multiple DDAHs"
                body={`Deleting the following ${selectedDdahs.length} DDAHs.`}
                confirmation={`Delete ${selectedDdahs.length} DDAHs`}
            />
        </React.Fragment>
    );
}
