import React from "react";
import { MatchableAssignment } from "../types";
import { Modal, Button } from "react-bootstrap";
import { upsertMatch } from "../actions";
import { useThunkDispatch } from "../../../../libs/thunk-dispatch";

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
                <input
                    className="form-control"
                    type="number"
                    defaultValue={
                        match && match.hoursAssigned > 0
                            ? match.hoursAssigned
                            : 0
                    }
                    onChange={(e) => setHoursAssigned(e.target.value)}
                />
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
