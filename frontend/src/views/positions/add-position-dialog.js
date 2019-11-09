import React from "react";
import { strip } from "../../libs/utils";
import { connect } from "react-redux";
import {
    upsertPosition,
    positionsSelector,
    instructorsSelector,
    contractTemplatesSelector
} from "../../api/actions";
import { Modal, Button, Alert } from "react-bootstrap";
import { PositionEditor } from "../../components/forms/position-editor";

function getConficts(position, positions = []) {
    const ret = { delayShow: "", immediateShow: "" };
    if (
        !strip(position.position_code) ||
        !strip(position.start_date) ||
        !strip(position.end_date)
    ) {
        ret.delayShow = "A position code, start date, and end date is required";
    }
    const matchingSession = positions.find(
        x => strip(x.position_code) === strip(position.position_code)
    );
    if (matchingSession) {
        ret.immediateShow = (
            <p>Another position exists with name={position.position_code}</p>
        );
    }
    return ret;
}

const BLANK_POSITION = {
    position_code: "",
    position_title: "",
    hours_per_assignment: 0,
    contract_template_id: null,
    duties:
        "Some combination of marking, invigilating, tutorials, office hours, and the help centre.",
    instructors: []
};

export function AddPositionDialog(props) {
    const {
        show,
        onHide = () => {},
        positions,
        upsertPosition,
        instructors,
        contractTemplates
    } = props;
    const [newPosition, setNewPosition] = React.useState(BLANK_POSITION);

    React.useEffect(() => {
        if (!show) {
            // If the dialog is hidden, reset the state
            setNewPosition(BLANK_POSITION);
        }
    }, [show]);

    function createInstructor() {
        upsertPosition(newPosition);
        onHide();
    }

    const conflicts = getConficts(newPosition, positions);

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add Position</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <PositionEditor
                    position={newPosition}
                    setPosition={setNewPosition}
                    instructors={instructors}
                    contractTemplates={contractTemplates}
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
                    title={conflicts.delayShow || "Create Position"}
                    disabled={
                        !!conflicts.delayShow || !!conflicts.immediateShow
                    }
                >
                    Create Position
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export const ConnectedAddPositionDialog = connect(
    state => ({
        positions: positionsSelector(state),
        instructors: instructorsSelector(state),
        contractTemplates: contractTemplatesSelector(state)
    }),
    { upsertPosition }
)(AddPositionDialog);
