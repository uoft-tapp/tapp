import React from "react";
import { ConnectedAddPositionDialog } from "./add-position-dialog";
import {
    Button,
    ButtonToolbar,
    ButtonGroup,
    ToggleButtonGroup,
    ToggleButton,
} from "react-bootstrap";
import { ConnectedPositionsList } from "./position-list";

export function AdminPositionsView() {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    const [advancedView, setAdvancedView] = React.useState("simple");
    return (
        <div>
            <ButtonToolbar className="d-flex justify-content-between px-3 py-2">
                <ButtonGroup>
                    <Button
                        onClick={() => {
                            setAddDialogVisible(true);
                        }}
                    >
                        Add Position
                    </Button>
                </ButtonGroup>
                <ToggleButtonGroup
                    type="radio"
                    value={advancedView}
                    name="advancedView"
                    onChange={(val) => setAdvancedView(val)}
                >
                    <ToggleButton
                        className="toggle-button"
                        value="simple"
                        variant="light"
                    >
                        Simple View
                    </ToggleButton>
                    <ToggleButton
                        className="toggle-button"
                        value="advanced"
                        variant="light"
                    >
                        Advanced View
                    </ToggleButton>
                </ToggleButtonGroup>
            </ButtonToolbar>

            <ConnectedAddPositionDialog
                show={addDialogVisible}
                onHide={() => {
                    setAddDialogVisible(false);
                }}
            />
            <ConnectedPositionsList />
        </div>
    );
}

export { ConnectedAddPositionDialog, ConnectedPositionsList };
