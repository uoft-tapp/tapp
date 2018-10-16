import React from "react"
import { Panel, ListGroup, ListGroupItem } from "react-bootstrap"

class CourseList extends React.Component {
    render() {
        return (
            <Panel className="course-list-panel" header="Courses">
                <ListGroup className="course-list-group">
                    {this.props.positions.map(({ id, course_code }) => (
                        <ListGroupItem key={id} title={course_code} className="course-list-item">
                            <a className="course" href={"#" + id}>
                                {course_code}
                            </a>
                            <a
                                href="#temp"
                                id={"email-" + id}
                                title="Send TA Assignment to Instructors"
                                className="email-icon"
                                // onClick={() =>
                                //     this.props.emailAssignments(course.code, course.round, id)
                                // }
                            >
                                <i className="fa fa-envelope-o" />
                            </a>
                            <a href="#temp" id={"spinner-" + id} className="spinning-icon">
                                <i className="fa fa-spinner fa-spin" />
                            </a>
                        </ListGroupItem>
                    ))}
                </ListGroup>
            </Panel>
        )
    }
}

export default CourseList
