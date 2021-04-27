import React from "react";
import { strip } from "../../../libs/utils";
import { connect } from "react-redux";
import {
    upsertPosition,
    positionsSelector,
    instructorsSelector,
    contractTemplatesSelector,
} from "../../../api/actions";
import { Modal, Button, Alert } from "react-bootstrap";
import { PositionEditor } from "../../../components/forms/position-editor";
import {
    ContractTemplate,
    Instructor,
    Position,
} from "../../../api/defs/types";

function getConflicts(position: Position, positions: Position[] = []) {
    const ret: { delayShow: string; immediateShow: React.ReactNode } = {
        delayShow: "",
        immediateShow: "",
    };
    if (!strip(position.position_code)) {
        ret.delayShow = "A position code is required";
    }
    const matchingSession = positions.find(
        (x) => strip(x.position_code) === strip(position.position_code)
    );
    if (matchingSession) {
        ret.immediateShow = (
            <p>Another position exists with name={position.position_code}</p>
        );
    }
    return ret;
}

const BLANK_POSITION: Partial<Position> = {
    position_code: "",
    position_title: "",
    hours_per_assignment: 0,
    duties:
        "Some combination of marking, invigilating, tutorials, office hours, and the help centre.",
    instructors: [],
};

export function AddPositionDialog(props: {
    show: boolean;
    onHide: (...args: any[]) => any;
    positions: Position[];
    upsertPosition: Function;
    instructors: Instructor[];
    contractTemplates: ContractTemplate[];
}) {
    const {
        show,
        onHide = () => {},
        positions,
        upsertPosition,
        instructors,
        contractTemplates,
    } = props;
    const [newPosition, setNewPosition] = React.useState(BLANK_POSITION);

    React.useEffect(() => {
        if (!show) {
            // If the dialog is hidden, reset the state
            setNewPosition(BLANK_POSITION);
        }
    }, [show]);

    // select a suitable default for the contract template
    React.useEffect(() => {
        // Look for a contract template whose name is "standard" or "default";
        // If that fails, find one whose name contains "standard" or "default";
        // If all else fails, pick the first template in the list
        const defaultTemplate =
            contractTemplates.find(
                (x) => x.template_name.toLowerCase() === "standard"
            ) ||
            contractTemplates.find(
                (x) => x.template_name.toLowerCase() === "default"
            ) ||
            contractTemplates.find((x) =>
                x.template_name.toLowerCase().includes("standard")
            ) ||
            contractTemplates.find((x) =>
                x.template_name.toLowerCase().includes("default")
            ) ||
            contractTemplates[0];
        if (defaultTemplate) {
            BLANK_POSITION.contract_template = defaultTemplate;
        }
    }, [contractTemplates]);

    function createPosition() {
        upsertPosition(newPosition);
        onHide();
    }

    const conflicts = getConflicts(newPosition as Position, positions);

    return (
        <Modal show={show} onHide={onHide} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Add Position</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <PositionEditor
                    position={newPosition}
                    setPosition={setNewPosition}
                    instructors={instructors}
                    contractTemplates={contractTemplates}
                    defaultContractTemplate={BLANK_POSITION.contract_template}
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
                    onClick={createPosition}
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
    (state) => ({
        positions: positionsSelector(state),
        instructors: instructorsSelector(state),
        contractTemplates: contractTemplatesSelector(state),
    }),
    { upsertPosition }
)(AddPositionDialog);
