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
import { Posting, Session } from "../../../api/defs/types";
import {
    ActionHeader,
    ActionsList,
    ActionButton,
} from "../../../components/action-buttons";
import { MissingActiveSessionWarning } from "../../../components/sessions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { useParams } from "react-router";
import { ConnectedPostingDetailsView } from "./posting-details/details-view";
import { Alert, Modal } from "react-bootstrap";
import { FaLink } from "react-icons/fa";
import { ConnectedExportPostingsAction } from "./import-export";

function PostingLinkDialog({
    posting,
    visible,
    onHide,
}: {
    posting: Posting;
    visible: boolean;
    onHide: (...args: any[]) => void;
}) {
    const url = new URL(window.location.origin);
    // We use `pathname` instead of `hash` here to work around routing
    // issues for pre-authenticated users.
    url.pathname = `/hash/public/postings/${posting.url_token}`;

    let warning = null;
    if (posting.posting_positions.length === 0) {
        warning = (
            <Alert variant="warning">
                This posting has no associated positions, which means applicants
                cannot currently complete an application.
            </Alert>
        );
    }

    return (
        <Modal show={visible} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Posting URL</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {warning}
                <p>
                    You can distribute the following link to give access to the
                    posting <em>{posting.name}</em>
                </p>
                <p>
                    <a href={url.href}>{url.href}</a>
                </p>
            </Modal.Body>
        </Modal>
    );
}

function ConnectedPostingDetails() {
    const activeSession = useSelector(activeSessionSelector) as Session | null;
    const postings = useSelector(postingsSelector);
    const dispatch = useThunkDispatch();
    const [urlDialogVisible, setUrlDialogVisible] = React.useState(false);
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

    let warning = null;
    if (posting.posting_positions.length === 0) {
        warning = (
            <Alert variant="warning">
                This posting has no associated positions, which means applicants
                cannot currently complete an application.
            </Alert>
        );
    }

    return (
        <div className="page-body">
            <ActionsList>
                <ActionHeader>Available Actions</ActionHeader>
                <ActionButton
                    onClick={() => setUrlDialogVisible(true)}
                    icon={FaLink}
                >
                    Get Link to Posting
                </ActionButton>
                <ActionHeader>Import/Export</ActionHeader>
                <ConnectedExportPostingsAction postingId={posting_id} />
            </ActionsList>
            <ContentArea>
                {activeSession ? null : (
                    <MissingActiveSessionWarning extraText="To view, modify, or create postings, you must select a session." />
                )}
                {warning}
                <ConnectedPostingDetailsView posting={posting} />
            </ContentArea>
            <PostingLinkDialog
                posting={posting}
                visible={urlDialogVisible}
                onHide={() => setUrlDialogVisible(false)}
            />
        </div>
    );
}

export { ConnectedPostingDetails as PostingDetails };
