import React from "react";
import { ConnectedAddPositionDialog } from "./add-position-dialog";
import {
    ConnectedPositionsList,
    ConnectedPositionsListToolbar,
} from "./position-list";

export function AdminPositionsView() {
    const [advancedView, setAdvancedView] = React.useState("simple");
    const [viewableColumns, setViewableColumns] = React.useState(new Set());
    const [selectedColumns, setSelectedColumns] = React.useState(
        viewableColumns
    );

    return (
        <div>
            {/** <ConnectedAddPositionDialog
                show={addDialogVisible}
                onHide={() => {
                    setAddDialogVisible(false);
                }}
            />**/}
            <ConnectedPositionsListToolbar
                advancedView={advancedView}
                setAdvancedView={setAdvancedView}
                setViewableColumns={setViewableColumns}
                setSelectedColumns={setSelectedColumns}
            />
            <ConnectedPositionsList
                view={advancedView}
                viewableColumns={selectedColumns}
            />
        </div>
    );
}

export { ConnectedAddPositionDialog, ConnectedPositionsList };
