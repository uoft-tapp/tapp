import React from "react";
import { useSelector } from "react-redux";
import { Position } from "../../../api/defs/types";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import { Button, Modal } from "react-bootstrap";
import { PositionsDetails } from "./position-details";
import { selectedPositionSelector, setSelectedPosition } from "./actions";

function PositionDetailsDialog({
    position,
    visible,
    onHide,
}: {
    position: Position;
    visible: boolean;
    onHide: (...args: any[]) => any;
}) {
    return (
        <Modal show={visible} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Details for {position.position_code}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <PositionsDetails position={position} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export function ConnectedPositionDetailsDialog() {
    const selectedPosition = useSelector(selectedPositionSelector);
    const dispatch = useThunkDispatch();

    if (selectedPosition == null) {
        return null;
    }

    return (
        <PositionDetailsDialog
            visible={!!selectedPosition}
            position={selectedPosition}
            onHide={() => dispatch(setSelectedPosition(null))}
        />
    );
}
