import React from "react";
import { ConnectedAddPositionDialog } from "./add-position-dialog";
import {
    ConnectedPositionsList,
    ConnectedPositionsListToolbar,
} from "./position-list";

export function AdminPositionsView() {
    const defaultColumns = new Set(
        [
            "position code",
            "position title",
            "hours",
            "start date",
            "end date",
            "instructors",
            "contract template",
        ].map((column) => column.toLowerCase())
    );
    const [advancedView, setAdvancedView] = React.useState("simple");
    const [selectedColumns, setSelectedColumns] = React.useState(
        defaultColumns
    );

    return (
        <div>
            <ConnectedPositionsListToolbar
                defaultColumns={defaultColumns}
                advancedView={advancedView}
                setAdvancedView={setAdvancedView}
                setSelectedColumns={setSelectedColumns}
                selectedColumns={selectedColumns}
            />
            <ConnectedPositionsList selectedColumns={selectedColumns} />
        </div>
    );
}

export { ConnectedAddPositionDialog, ConnectedPositionsList };
