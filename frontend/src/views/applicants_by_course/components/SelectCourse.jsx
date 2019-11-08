import React from "react";
import { connect } from "react-redux";
import { fetchPositions } from "../../../api/actions/positions.js";
import {
    positionsSelector,
    viewPosition,
    switchPositions
} from "../../../api/actions";
import { Card, ListGroup, ListGroupItem } from "react-bootstrap";

class SelectCourse extends React.Component {
    componentDidMount() {
        this.props.fetchPositions();
    }
    getActive = item => this.props.selectedPositionIds.indexOf(item.id) !== -1;
    render() {
        return (
            <Card>
                <Card.Header>
                    Courses{" "}
                    {this.props.selectedPositionIds.length === 2 && (
                        <span
                            style={{ cursor: "pointer" }}
                            className="fa fa-arrows-h"
                            onClick={this.props.switchPositions}
                        />
                    )}
                </Card.Header>
                <ListGroup>
                    {this.props.positions.map(item => (
                        <ListGroupItem
                            key={item.id}
                            onClick={() => this.props.viewPosition(item.id)}
                            active={this.getActive(item)}
                        >
                            {item.position_code}
                        </ListGroupItem>
                    ))}
                </ListGroup>
            </Card>
        );
    }
}


export default connect((state) => ({
    positions: positionsSelector(state),
    selectedPositionIds: state.model.applicantsByCourse.selectedPositionIds
}),
{ fetchPositions, viewPosition, switchPositions }
)(SelectCourse);