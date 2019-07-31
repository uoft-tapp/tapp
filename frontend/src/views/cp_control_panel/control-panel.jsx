import React from 'react';
import { PositionsList } from "../../components/positions-list";
import { connect } from "react-redux";
import { positionsSelector } from "../../api/actions";
import { ConnectedSessionSelect } from "../utils"


class ControlPanel extends React.Component {

  render() {
    return (
      <div>
        <ConnectedSessionSelect/>
        <PositionsList positions={this.props.positions}/>
      </div>
    );
  }
}



export default connect(state => ({positions: positionsSelector(state)}))(ControlPanel);