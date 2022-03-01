import React from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import {
    activeSessionSelector,
    fetchPostingPositionsForPosting,
    fetchPostings,
    postingsSelector,
} from "../../../api/actions";
import { ContentArea } from "../../../components/layout";
import { Session } from "../../../api/defs/types";
import { ActionHeader, ActionsList } from "../../../components/action-buttons";
import { MissingActiveSessionWarning } from "../../../components/sessions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { useParams } from "react-router";
import { ConnectedPostingPreviewView } from "./posting-details/preview-view";

function ConnectedPostingPreview() {
    const activeSession = useSelector(activeSessionSelector) as Session | null;
    const postings = useSelector(postingsSelector);
    const dispatch = useThunkDispatch();
    const [postingIsForDifferentSession, setPostingIsForDifferentSession] =
        React.useState(false);

    const params = useParams<{ posting_id?: string }>();
    const posting_id =
        params.posting_id != null ? parseInt(params.posting_id, 10) : null;

    // We don't load postings by default, so we load them dynamically whenever
    // we view this page.
    React.useEffect(() => {
        async function fetchResources() {
            try {
                const posting = { id: posting_id || 0 };
                const postings = await dispatch(fetchPostings());
                // If we are viewing a posting for a different session, we want to route
                // back to the overview page instead of continuing.
                if (!postings.some((p) => p.id === posting.id)) {
                    setPostingIsForDifferentSession(true);
                    return;
                } else {
                    setPostingIsForDifferentSession(false);
                }
                await dispatch(fetchPostingPositionsForPosting(posting));
            } catch (e) {}
        }

        if (activeSession && posting_id != null) {
            fetchResources();
        }
    }, [activeSession, posting_id, dispatch]);

    const posting = postings.find((posting) => posting.id === posting_id);

    if (postingIsForDifferentSession) {
        return <Redirect to="/postings/overview" />;
    }
    if (posting_id == null) {
        return (
            <div className="page-body">
                <ContentArea>
                    <h4>Cannot view a Posting without a valid posting id</h4>
                </ContentArea>
            </div>
        );
    }

    if (posting == null) {
        return (
            <div className="page-body">
                <ContentArea>
                    <h4>Cannot Posting with id={posting_id}</h4>
                </ContentArea>
            </div>
        );
    }

    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Available Actions</ActionHeader>
                <ActionHeader>Import/Export</ActionHeader>
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view, modify, or create postings, you must select a session." />
                )}
                <ConnectedPostingPreviewView posting={posting} />
            </ContentArea>
        </div>
    );
}

export { ConnectedPostingPreview as PostingPreview };
