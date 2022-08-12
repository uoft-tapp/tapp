import React from "react";
import { ApplicantSummary } from "../../../types";
import { RiStickyNoteFill } from "react-icons/ri";
import { Form, Modal, Button } from "react-bootstrap";
import { upsertNote } from "../../../actions";
import { useThunkDispatch } from "../../../../../../libs/thunk-dispatch";

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
    const [noteTemp, setNoteTemp] = React.useState(applicantSummary.note || "");

    const updateApplicantNote = React.useCallback(
        (note: string) => {
            dispatch(
                upsertNote({
                    utorid: applicantSummary.applicant.utorid,
                    note: noteTemp,
                })
            );
        },
        [dispatch, noteTemp, applicantSummary]
    );

    return (
        <>
            <RiStickyNoteFill
                className={`applicant-icon ${
                    applicantSummary.note && applicantSummary.note.length > 0
                        ? "active"
                        : "inactive"
                }`}
                onClick={() => setShow(true)}
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
                                onChange={(e) => setNoteTemp(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => setShow(false)}
                        variant="outline-secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            updateApplicantNote(noteTemp);
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
