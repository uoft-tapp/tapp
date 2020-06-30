import React from "react";
import { connect } from "react-redux";
import { positionsSelector } from "../../api/actions";
import { ConnectedAddPositionDialog } from "./add-position-dialog";
import {
    Badge,
    Button,
    ButtonToolbar,
    ButtonGroup,
    ToggleButton,
    ToggleButtonGroup,
} from "react-bootstrap";

function getFetchedColumnHeadings(positions) {
    return [
        ...new Set(
            positions.reduce(
                (acc, position) => [...acc, ...Object.keys(position)],
                []
            )
        ),
    ];
}

export function PositionsListToolbar(props) {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    const {
        positions,
        advancedView,
        setAdvancedView,
        setViewableColumns,
        setSelectedColumns,
    } = props;
    console.log(props);
    const selectedColumns = [];

    return (
        <React.Fragment>
            <ConnectedAddPositionDialog
                show={addDialogVisible}
                onHide={() => setAddDialogVisible(false)}
            />
            <ButtonToolbar className="d-flex justify-content-between flex-nowrap px-3 py-2">
                <Button
                    className="text-nowrap align-self-center"
                    onClick={() => {
                        setAddDialogVisible(true);
                    }}
                >
                    Add Position
                </Button>
                <ToggleButtonGroup
                    type="checkbox"
                    value={selectedColumns}
                    name="selectedColumns"
                    className="d-flex align-content-center flex-wrap mx-3"
                >
                    {getFetchedColumnHeadings(positions).map((heading) => (
                        <ToggleButton
                            type="checkbox"
                            value={heading}
                            variant="light"
                            size="sm"
                            className="text-left font-weight-lighter text-capitalize text-nowrap flex-grow-0 flex-shrink-1"
                        >
                            {heading.replace(/_/gi, " ")}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                <ToggleButtonGroup
                    className="align-self-center"
                    type="radio"
                    value={advancedView}
                    name="advancedView"
                    onChange={(val) => setAdvancedView(val)}
                >
                    <ToggleButton
                        className="toggle-button text-nowrap"
                        value="simple"
                        variant="light"
                    >
                        Simple View
                    </ToggleButton>
                    <ToggleButton
                        className="toggle-button text-nowrap"
                        value="advanced"
                        variant="light"
                    >
                        Advanced View
                    </ToggleButton>
                </ToggleButtonGroup>
            </ButtonToolbar>
        </React.Fragment>
    );
}
