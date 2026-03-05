import React from "react";
import { strip } from "../../../libs/utils";
import { useSelector } from "react-redux";
import { upsertPosting, postingsSelector } from "../../../api/actions";
import { Modal, Button, Alert } from "react-bootstrap";
import { Posting } from "../../../api/defs/types";
import { PostingEditor } from "../../../components/forms/posting-editor";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";

interface Conflict {
    delayShow: string;
    immediateShow: React.ReactElement | string;
}

function getConflicts(posting: Partial<Posting>, postings: Posting[] = []) {
    const ret: Conflict = { delayShow: "", immediateShow: "" };
    if (!strip(posting.name)) {
        ret.delayShow = "A name is required.";
    }
    const matchingPosting = postings.find(
        (x) => strip(x.name) === strip(posting.name)
    );
    if (matchingPosting) {
        ret.immediateShow = (
            <p>Another session exists with name={posting.name}</p>
        );
    }
    return ret;
}

const BLANK_POSTING = {
    name: "",
    open_date: "",
    close_date: "",
    intro_text: "",
};

export function ConnectedAddPostingDialog({
    show,
    onHide = () => {},
}: {
    show: boolean;
    onHide: () => any;
}) {
    const [newPosting, setNewPosting] = React.useState(BLANK_POSTING);
    const postings: Posting[] = useSelector(postingsSelector);
    const dispatch = useThunkDispatch();
    async function _upsertPosting(posting: Partial<Posting>) {
        await dispatch(upsertPosting(posting));
    }

    React.useEffect(() => {
        if (!show) {
            // If the dialog is hidden, reset the state
            setNewPosting(BLANK_POSTING);
        }
    }, [show]);

    function createInstructor() {
        _upsertPosting(newPosting);
        onHide();
    }

    const conflicts = getConflicts(newPosting, postings);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add Posting</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <PostingEditor
                    posting={newPosting as Posting}
                    setPosting={setNewPosting as any}
                />
                {conflicts.immediateShow ? (
                    <Alert variant="danger">{conflicts.immediateShow}</Alert>
                ) : null}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button
                    onClick={createInstructor}
                    title={conflicts.delayShow || "Create Session"}
                    disabled={
                        !!conflicts.delayShow || !!conflicts.immediateShow
                    }
                >
                    Create Posting
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
