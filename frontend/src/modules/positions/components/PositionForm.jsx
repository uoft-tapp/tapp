import React from "react"
import { ListGroupItem } from "react-bootstrap"
import Instructors from "./Instructors"
import PositionDescriptions from "./PositionDescriptions"
import { Field } from "redux-form"

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
                                    name={`positions.${position.id}.estimated_enrol`}
                                    component={({ input }) => <input type="number" {...input} />}
                                />
                                <Field
                                    name={`positions.${position.id}.cap_enrolment`}
                                    component={({ input }) => <input type="number" {...input} />}
                                />
                                <Field
                                    name={`positions.${position.id}.num_waitlisted`}
                                    component={({ input }) => <input type="number" {...input} />}
                                />
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
                                <Field
                                    name={`positions.${position.id}.openings`}
                                    component={({ input }) => <input type="number" {...input} />}
                                />
                                <Field
                                    name={`positions.${position.id}.hours`}
                                    component={({ input }) => <input type="number" {...input} />}
                                />
                            </td>
                            <td className="col-6">
                                <p>
                                    <b>Start Date: </b>
                                </p>
                                <Field
                                    name={`positions.${position.id}.round.start_date`}
                                    component={({ input }) => <input type="date" {...input} />}
                                />
                                <p>
                                    <b>End Date: </b>
                                </p>
                                <Field
                                    name={`positions.${position.id}.round.end_date`}
                                    component={({ input }) => <input type="date" {...input} />}
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
