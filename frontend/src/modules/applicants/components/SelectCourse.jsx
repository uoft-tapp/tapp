import React from "react"
import { ListGroup, ListGroupItem, Panel } from "react-bootstrap"

class SelectCourse extends React.Component {
    render() {
        return (
            <Panel>
                <Panel.Heading>Courses</Panel.Heading>
                <ListGroup>
                    <ListGroupItem>Item 1</ListGroupItem>
                    <ListGroupItem>Item 2</ListGroupItem>
                    <ListGroupItem>...</ListGroupItem>
                </ListGroup>
            </Panel>
        )
    }
}

export default SelectCourse
