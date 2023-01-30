import React from "react";
import { Application } from "../../../../api/defs/types";
import { Modal, Button } from "react-bootstrap";
import { ApplicationDetails } from "../../applications/application-details";

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
            show={Boolean(application)}
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
