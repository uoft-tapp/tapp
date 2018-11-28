import React from "react"
import { connect } from "react-redux"
import { fetchPositions } from "../../positions/actions"
import { viewPosition, switchPositions } from "../actions"
import { ListGroup, ListGroupItem, Panel } from "react-bootstrap"

class SelectCourse extends React.Component {
    componentDidMount() {
        this.props.fetchPositions()
    }
    getActive = item => this.props.openPositions.indexOf(item.id) !== -1
    render() {
        const dummyPositions = [
            {
                id: 1,
                course_code: "temp1"
            },
            {
                id: 2,
                course_code: "temp2"
            },
            {
                id: 3,
                course_code: "temp3"
            },
            {
                id: 4,
                course_code: "temp4"
            }
        ]
        return (
            <Panel>
                <Panel.Heading>
                    Courses{" "}
                    {this.props.openPositions.length === 2 && (
                        <span
                            style={{ cursor: "pointer" }}
                            className="fa fa-arrows-h"
                            onClick={this.props.switchPositions}
                        />
                    )}
                </Panel.Heading>
                <ListGroup>
                    {dummyPositions.map(item => (
                        <ListGroupItem
                            key={item.id}
                            onClick={() => this.props.viewPosition(item.id)}
                            active={this.getActive(item)}
                        >
                            {item.course_code}
                        </ListGroupItem>
                    ))}
                </ListGroup>
            </Panel>
        )
    }
}

export default connect(
    ({ applicants: { openPositions }, positions: { list } }) => ({
        positions: list,
        openPositions
    }),
    { fetchPositions, viewPosition, switchPositions }
)(SelectCourse)
