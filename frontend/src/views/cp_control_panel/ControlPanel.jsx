import React from "react";
import { PositionsList } from "../../components/positions-list";
import { FilteredList } from "../../components/filtered-list";
import { connect } from "react-redux";
import { positionsSelector } from "../../api/actions";

const ConnectedFilteredList = connect((state, ownProps) => ({
    positions: positionsSelector(state),
    listRenderer: ownProps.listRenderer
}))(FilteredList);

function ControlPanel() {
    // dummy filter function
    const filter = (data, query) => {
        if (!query) {
            return data;
        }
        return data;
    };

    return (
        <div>
            <ConnectedFilteredList
                listRenderer={PositionsList}
                filterFunc={filter}
            />
        </div>
    );
}

export default ControlPanel;
