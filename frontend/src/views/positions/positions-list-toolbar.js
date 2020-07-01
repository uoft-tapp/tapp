import React from "react";
import { formatColumnName } from "../../libs/utils";
import { ConnectedAddPositionDialog } from "./add-position-dialog";
import {
    Badge,
    Button,
    ButtonToolbar,
    ToggleButton,
    ToggleButtonGroup,
} from "react-bootstrap";

const BLACKLIST = ["instructor_preferences"]; // Any fields here will not be accessible in the column selector.

/**
 * Builds an array (with no duplicates) of all column headings which appear at least once in the positions data from the database
 * All headings which are present in the blacklist (defined above) are removed from this list
 *
 * @param {*} positions the positions data which was returned from a GET request to the admin/positions endpoint.
 * @returns an array with no duplicates containing headings in the format [a-z][a-z]*_[a-z]*
 */
function getFetchedColumnHeadings(positions) {
    return [
        ...new Set(
            positions
                .reduce(
                    (acc, position) => [...acc, ...Object.keys(position)],
                    []
                )
                .filter((heading) => !BLACKLIST.includes(heading))
        ),
    ];
}

/**
 * Builds an array of ToggleButton elements for use in the column selector component.
 *
 * @param {*} viewableColumns an array of all viewable column names imported from the database in the form [a-z][a-z]*_[a-z]*
 * @param {*} selectedColumns a set of the the column names which are selected (currently being displayed)
 */
function getColumnSelector(viewableColumns, selectedColumns) {
    return viewableColumns.map((heading) => {
        const lowercase = formatColumnName(heading).toLowerCase();
        const isSelected = selectedColumns.has(lowercase);

        return (
            <ToggleButton
                type="checkbox"
                value={lowercase}
                key={lowercase}
                variant="light"
                size="sm"
                className="text-left font-weight-lighter text-capitalize text-nowrap flex-grow-0 m-1"
            >
                {formatColumnName(heading)}
                <Badge
                    variant={
                        isSelected ? "outline-primary" : "outline-secondary"
                    }
                >
                    {isSelected ? "✓" : "❌"}
                </Badge>
            </ToggleButton>
        );
    });
}
/**
 * A toolbar containing the add position button, the columns selector, and the simple/advanced view toggle button
 *
 * @param {*} props
 */
export function PositionsListToolbar(props) {
    const [addDialogVisible, setAddDialogVisible] = React.useState(false);
    const {
        positions,
        defaultColumns,
        advancedView,
        setAdvancedView,
        selectedColumns,
        setSelectedColumns,
    } = props;
    const isAdvanced = advancedView === "advanced";

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
                    onChange={(e) => {
                        if (selectedColumns.has(e[1])) {
                            selectedColumns.delete(e[1]);
                        } else {
                            selectedColumns.add(e[1]);
                        }
                        setSelectedColumns(new Set(selectedColumns));
                    }}
                    name="selectedColumns"
                    className="d-flex align-content-center align-self-center flex-wrap mx-3"
                >
                    {isAdvanced &&
                        getColumnSelector(
                            getFetchedColumnHeadings(positions),
                            selectedColumns
                        )}
                </ToggleButtonGroup>
                <ToggleButtonGroup
                    className="align-self-center"
                    type="radio"
                    value={advancedView}
                    name="advancedView"
                    onChange={(val) => {
                        if (val === "simple") {
                            setSelectedColumns(defaultColumns);
                        }
                        setAdvancedView(val);
                    }}
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
