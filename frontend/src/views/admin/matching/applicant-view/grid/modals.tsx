import React from "react";
import { Application } from "../../../../../api/defs/types";
import { Match } from "../../types";
import { Form, Modal, Button } from "react-bootstrap";
import { ApplicationDetails } from "../../../applications/application-details";

/**
 * A modal window displaying detailed information about an application.
 */
export function ApplicationDetailModal({
    application,
    setShownApplication,
}: {
    application: Application | null;
    setShownApplication: Function;
}) {
    if (!application) {
        return null;
    }

    return (
        <Modal
            show={!!application}
            onHide={() => setShownApplication(null)}
            size="xl"
        >
            <Modal.Header closeButton>
                <Modal.Title>Application Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {application && (
                    <ApplicationDetails application={application} />
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    onClick={() => setShownApplication(null)}
                    variant="outline-secondary"
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

/**
 * A modal window allowing users to change the number of hours an applicant
 * is assigned to a course.
 */
export function AdjustHourModal({
    applicantMatch,
    updateApplicantMatch,
    show,
    setShow,
}: {
    applicantMatch: Match | null;
    updateApplicantMatch: Function;
    show: boolean;
    setShow: Function;
}) {
    const [hoursAssigned, setHoursAssigned] = React.useState("");
    if (!applicantMatch) {
        return null;
    }

    return (
        <Modal show={show} onHide={() => setShow(false)} size="sm">
            <Modal.Header closeButton>
                <Modal.Title>Update Hours</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="number"
                            defaultValue={
                                applicantMatch &&
                                applicantMatch.hoursAssigned > 0
                                    ? applicantMatch.hoursAssigned
                                    : 0
                            }
                            onChange={(e) => setHoursAssigned(e.target.value)}
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
                        updateApplicantMatch(
                            "staged-assigned",
                            Number(hoursAssigned)
                        );
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
