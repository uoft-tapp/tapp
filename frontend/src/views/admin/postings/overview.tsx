import React from "react";
import { useSelector } from "react-redux";
import { activeSessionSelector, fetchPostings } from "../../../api/actions";
import { ContentArea } from "../../../components/layout";
import { Session } from "../../../api/defs/types";
import {
    ActionButton,
    ActionHeader,
    ActionsList,
} from "../../../components/action-buttons";
import { MissingActiveSessionWarning } from "../../../components/sessions";
import { FaPlus } from "react-icons/fa";
import { ConnectedPostingsList } from "./posting-list";
import { ConnectedAddPostingDialog } from "./add-posting-dialog";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

function ConnectedPostingOverview() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    const activeSession = useSelector(activeSessionSelector) as Session | null;
    const dispatch = useThunkDispatch();

    // We don't load postings by default, so we load them dynamically whenever
    // we view this page.
    React.useEffect(() => {
        async function fetchResources() {
            return await dispatch(fetchPostings());
        }

        if (activeSession) {
            fetchResources();
        }
    }, [activeSession, dispatch]);

    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Available Actions</ActionHeader>
                <ActionButton
                    icon={<FaPlus />}
                    onClick={() => setAddDialogVisible(true)}
                    disabled={!activeSession}
                >
                    New Posting
                </ActionButton>
                <ActionHeader>Import/Export</ActionHeader>
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view, modify, or create postings, you must select a session." />
                )}
                <ConnectedAddPostingDialog
                    show={addDialogVisible}
                    onHide={() => setAddDialogVisible(false)}
                />
                <ConnectedPostingsList />
            </ContentArea>
        </div>
    );
}

export { ConnectedPostingOverview as PostingOverview };
