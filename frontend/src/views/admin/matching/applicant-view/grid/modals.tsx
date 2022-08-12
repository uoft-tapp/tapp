import React from "react";
import { Application } from "../../../../../api/defs/types";
import { MatchableAssignment } from "../../types";
import { Form, Modal, Button } from "react-bootstrap";
import { ApplicationDetails } from "../../../applications/application-details";
import { upsertMatch } from "../../actions";
import { useThunkDispatch } from "../../../../../libs/thunk-dispatch";

/**
 * A modal window displaying detailed information about an application.
 */
export function ApplicationDetailModal({
    application,
    setShownApplication,
}: {
    application: Application | null;
    setShownApplication: (application: Application | null) => void;
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
    match,
    show,
    setShow,
}: {
    match: MatchableAssignment;
    show: boolean;
    setShow: (arg0: boolean) => void;
}) {
    const [hoursAssigned, setHoursAssigned] = React.useState("");
    const dispatch = useThunkDispatch();
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
                                match && match.hoursAssigned > 0
                                    ? match.hoursAssigned
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
                    disabled={hoursAssigned === ""}
                    onClick={() => {
                        dispatch(
                            upsertMatch({
                                positionCode: match.position.position_code,
                                utorid: match.applicant.utorid,
                                stagedAssigned: true,
                                stagedHoursAssigned: Number(hoursAssigned),
                            })
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
