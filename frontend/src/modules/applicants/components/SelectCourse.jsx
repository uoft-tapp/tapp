import React from "react"
import { connect } from "react-redux"
import { fetchPositions } from "../../positions/actions"
import { ListGroup, ListGroupItem, Panel } from "react-bootstrap"

class SelectCourse extends React.Component {
    componentDidMount() {
        this.props.fetchPositions()
    }
    render() {
        return (
            <Panel>
                <Panel.Heading>Courses</Panel.Heading>
                <ListGroup>
                    {this.props.positions.map(item => (
                        <ListGroupItem key={item.id}>{item.course_code}</ListGroupItem>
                    ))}
                </ListGroup>
            </Panel>
        )
    }
}

export default connect(
    ({ positions: { list } }) => ({ positions: list }),
    { fetchPositions }
)(SelectCourse)
