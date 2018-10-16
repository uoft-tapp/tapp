import React from "react"
import { ListGroupItem } from "react-bootstrap"
import Instructors from "./Instructors"
import Field from "./Field"
import PositionDescriptions from "./PositionDescriptions"

class CourseForm extends React.Component {
    render() {
        let instructors = [] // this.props.getInstructorsList()
        const { position } = this.props
        return (
            <ListGroupItem key={position.id}>
                <a href="#temp" name={position.id}>
                    {" "}
                </a>
                <table className="form-table">
                    <tbody>
                        <tr>
                            <td className="col-1">
                                <p>
                                    <input
                                        type="text"
                                        value={position.course_code}
                                        className="course"
                                        readOnly
                                        disabled
                                    />
                                </p>
                                <p>
                                    <input
                                        type="text"
                                        value={position.course_name}
                                        readOnly
                                        disabled
                                    />
                                </p>
                                <p>
                                    <input type="text" value="Campus?" readOnly disabled />
                                </p>
                            </td>
                            <td className="col-2">
                                <p>
                                    <b>Est./Curr. Enrol.: </b>
                                </p>
                                <p>
                                    <b>Enrol. Cap: </b>
                                </p>
                                <p>
                                    <b>Waitlist: </b>
                                </p>
                            </td>
                            <td className="col-3">
                                <Field
                                    fieldId="estimated_enrol"
                                    type="number"
                                    position={position}
                                />
                                <Field fieldId="cap_enrolment" type="number" position={position} />
                                <Field fieldId="num_waitlisted" type="number" position={position} />
                            </td>
                            <td className="col-4">
                                <p>
                                    <b>Openings: </b>
                                </p>
                                <p>
                                    <b>Hours/Pos.: </b>
                                </p>
                            </td>
                            <td className="col-5">
                                <Field fieldId="openings" type="number" position={position} />
                                <Field fieldId="hours" type="number" position={position} />
                            </td>
                            <td className="col-6">
                                <p>
                                    <b>Start Date: </b>
                                </p>
                                <Field
                                    fieldId="start_date"
                                    type="date"
                                    position={{ ...position, ...position.round }}
                                />
                                <p>
                                    <b>End Date: </b>
                                </p>
                                <Field
                                    fieldId="end_date"
                                    type="date"
                                    position={{ ...position, ...position.round }}
                                />
                            </td>

                            <td className="col-7">
                                <p>
                                    <b>
                                        Instructors
                                        <i
                                            className="fa fa-pencil button icon"
                                            title="Open Instructor Editor"
                                            onClick={() => this.props.showInstructorModal()}
                                        />
                                    </b>
                                </p>
                                <Instructors
                                    courseId={position.id}
                                    instructors={[]} //position.instructors}
                                    instructor_data={instructors}
                                    {...this.props}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <PositionDescriptions position={position} />
            </ListGroupItem>
        )
    }
}

export default CourseForm
