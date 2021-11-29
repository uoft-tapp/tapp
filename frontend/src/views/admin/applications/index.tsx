import React from "react";
import { ConnectedApplicationsList } from "./editable-application-list";
import { ConnectedExportApplicationsAction } from "./import-export";
import {
    ActionsList,
    ActionHeader,
    ActionButton,
} from "../../../components/action-buttons";
import { ContentArea } from "../../../components/layout";
import { useSelector } from "react-redux";
import { activeSessionSelector, fetchPostings } from "../../../api/actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { PreferencesLinkDialog } from "./application-details";
import { FaLink } from "react-icons/fa";

export function AdminApplicationsView() {
    const activeSession = useSelector(activeSessionSelector);
    const dispatch = useThunkDispatch();
    const [getLinkDialogVisible, setGetLinkDialogVisible] =
        React.useState(false);

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
                    onClick={() => setGetLinkDialogVisible(true)}
                    icon={FaLink}
                >
                    Instructors' Link
                </ActionButton>

                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedExportApplicationsAction />
            </ActionsList>
            <ContentArea>
                <ConnectedApplicationsList />
            </ContentArea>
            <PreferencesLinkDialog
                visible={getLinkDialogVisible}
                onHide={() => setGetLinkDialogVisible(false)}
            />
        </div>
    );
}
