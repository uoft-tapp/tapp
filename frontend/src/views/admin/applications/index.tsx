import React from "react";
import { ConnectedApplicationsList } from "./editable-application-list";
import { ConnectedExportApplicationsAction } from "./import-export";
import { ActionsList, ActionHeader } from "../../../components/action-buttons";
import { ContentArea } from "../../../components/layout";
import { useSelector } from "react-redux";
import { activeSessionSelector, fetchPostings } from "../../../api/actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

export function AdminApplicationsView() {
    const activeSession = useSelector(activeSessionSelector);
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

                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedExportApplicationsAction />
            </ActionsList>
            <ContentArea>
                <ConnectedApplicationsList />
            </ContentArea>
        </div>
    );
}
