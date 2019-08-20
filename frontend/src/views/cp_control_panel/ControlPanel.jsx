import React from "react";
import { PositionsList } from "../../components/positions-list";
import { FilteredList } from "../../components/filtered-list";
import { connect } from "react-redux";
import { positionsSelector } from "../../api/actions";
import { ConnectedSessionSelect } from "../sessions/ConnectedSessionSelector";

const ConnectedFilteredList = connect((state, ownProps) => ({
    data: positionsSelector(state),
    listRenderer: ownProps.listRenderer
}))(FilteredList);

function ControlPanel() {

    // dummy filter function
    const filter = (data, query) => {
        console.log(query);
        return data;
    };

    return (
        <div>
            <ConnectedSessionSelect />
            <ConnectedFilteredList listRenderer={PositionsList} filterFunc={filter} />
        </div>
    );
}

export default ControlPanel;
