import React from "react";
import { ApplicantSummary } from "../types";
import { Form, Modal, Button } from "react-bootstrap";
import { upsertNote } from "../actions";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";

/**
 * A modal window allowing users to view and edit notes for an applicant.
 */
export function ApplicantNoteModal({
    applicantSummary,
    show,
    setShow,
}: {
    applicantSummary: ApplicantSummary;
    show: boolean;
    setShow: (arg0: boolean) => void;
}) {
    const dispatch = useThunkDispatch();
    const [noteTemp, setNoteTemp] = React.useState(applicantSummary.note || "");

    const updateApplicantNote = React.useCallback(() => {
        dispatch(
            upsertNote({
                utorid: applicantSummary.applicant.utorid,
                note: noteTemp,
            })
        );
    }, [dispatch, noteTemp, applicantSummary]);

    return (
        <Modal show={show} onHide={() => setShow(false)}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Notes ({applicantSummary.applicant.first_name}{" "}
                    {applicantSummary.applicant.last_name})
                </Modal.Title>
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
                        updateApplicantNote();
                        setShow(false);
                    }}
                    variant="outline-primary"
                >
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
