import React from 'react';
import { PositionsList } from "../../components/positions-list";
import { FilteredList } from "../../components/filtered-list";
import { connect } from "react-redux";
import { positionsSelector } from "../../api/actions";
import { ConnectedSessionSelect } from "../sessions/ConnectedSessionSelector"


function ControlPanel() {

  const ConnectedFilteredList = connect((state, ownProps) => ({
    data: positionsSelector(state),
    listRenderer: ownProps.listRenderer
  }))(FilteredList);

  return (
    <div>
      <ConnectedSessionSelect/>
      <ConnectedFilteredList listRenderer={PositionsList}/>
    </div>
  );
}

export default ControlPanel;