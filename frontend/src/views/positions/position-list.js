import { connect } from "react-redux";
import { positionsSelector } from "../../api/actions";
import { PositionsList } from "../../components/positions-list";
import { PositionsListToolbar } from "./positions-list-toolbar";

export const ConnectedPositionsList = connect((state) => ({
    positions: positionsSelector(state),
}))(PositionsList);

export const ConnectedPositionsListToolbar = connect((state) => ({
    positions: positionsSelector(state),
}))(PositionsListToolbar);
