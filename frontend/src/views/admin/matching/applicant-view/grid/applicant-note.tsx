import React from "react";
import { ApplicantSummary } from "../../types";
import { RiStickyNoteFill } from "react-icons/ri";

import { Form, Modal, Button } from "react-bootstrap";

import { upsertNote } from "../../actions";
import { useThunkDispatch } from "../../../../../libs/thunk-dispatch";
import "../../styles.css";

/**
 * A button that displays a dialog allowing one to edit an applicant's notes.
 */
export function ApplicantNote({
    applicantSummary,
}: {
    applicantSummary: ApplicantSummary;
}) {
    const dispatch = useThunkDispatch();
    const [show, setShow] = React.useState(false);
    const [note, setNote] = React.useState(applicantSummary.note);

    function _onClick() {
        setShow(true);
    }

    function updateApplicantNote(note: string | null) {
        dispatch(
            upsertNote({
                utorid: applicantSummary.applicant.utorid,
                note: note,
            })
        );
    }

    return (
        <>
            <RiStickyNoteFill
                className={`applicant-icon ${
                    applicantSummary.note && applicantSummary.note.length > 0
                        ? "active"
                        : "inactive"
                }`}
                onClick={_onClick}
            />
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Applicant Note</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                defaultValue={applicantSummary.note || ""}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => setShow(false)}
                        variant="outline-secondary"
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            if (note?.length === 0) {
                                updateApplicantNote(null);
                            } else {
                                updateApplicantNote(note);
                            }
                            setShow(false);
                        }}
                        variant="outline-primary"
                    >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
