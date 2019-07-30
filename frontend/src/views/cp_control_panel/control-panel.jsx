import React from 'react';
import { PositionsList } from "../../components/positions-list";
import { connect } from "react-redux";
import { positionsSelector } from "../../api/actions";


function ControlPanel() {
  const ConnectedPositionsList = connect(state => ({
    positions: positionsSelector(state)
  }))(PositionsList);

  return (
    <div>
      <ConnectedPositionsList></ConnectedPositionsList>
    </div>
  );
}

export default ControlPanel;