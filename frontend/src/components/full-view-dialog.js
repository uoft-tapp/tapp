import React from "react";
import { connect } from "react-redux";
import { upsertPosition, positionsSelector } from "../api/actions";

import { Modal, Button } from "react-bootstrap";

function FullViewDialog(props) {
    const { show, onHide = () => {}, id, positions, upsertPosition } = props;

    function updatePosition() {
        upsertPosition({ id }); //and some other stuff
        onHide();
    }

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Position Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>...</Modal.Body>
            <Modal.Footer>
                <Button onClick={onHide} variant="light">
                    Cancel
                </Button>
                <Button onClick={updatePosition} variant="primary">
                    OK
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export const ConnectedFullViewDialog = connect(
    (state) => ({
        positions: positionsSelector(state),
    }),
    {
        upsertPosition,
    }
)(FullViewDialog);
