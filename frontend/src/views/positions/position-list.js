import { connect } from "react-redux";
import { positionsSelector } from "../../api/actions";
import { PositionsList } from "../../components/positions-list";

export const ConnectedPositionsList = connect((state) => ({
    positions: positionsSelector(state),
}))(PositionsList);
