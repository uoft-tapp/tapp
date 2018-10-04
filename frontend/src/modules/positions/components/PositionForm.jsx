import React from "react"
import { connect } from "react-redux"
import { ListGroupItem, Badge } from "react-bootstrap"
import { updatePositionValue } from "../actions"

class CourseForm extends React.Component {
    state = { expanded: false }
    toggleExpanded = e => {
        e.preventDefault()
        this.setState({
            expanded: !this.state.expanded
        })
    }

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
                                        value={position.code}
                                        className="course"
                                        readOnly
                                        disabled
                                    />
                                </p>
                                <p>
                                    <input type="text" value={position.name} readOnly disabled />
                                </p>
                                <p>
                                    <input type="text" value={position.campus} readOnly disabled />
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
                                <Form fieldId="estimatedEnrol" type="number" position={position} />
                                <Form fieldId="cap" type="number" position={position} />
                                <Form fieldId="waitlist" type="number" position={position} />
                            </td>
                            <td className="col-4">
                                <p>
                                    <b>Positions: </b>
                                </p>
                                <p>
                                    <b>Hours/Pos.: </b>
                                </p>
                            </td>
                            <td className="col-5">
                                <Form
                                    fieldId="estimatedPositions"
                                    type="number"
                                    position={position}
                                />
                                <Form fieldId="positionHours" type="number" position={position} />
                            </td>
                            <td className="col-6">
                                <p>
                                    <b>Start Date: </b>
                                </p>
                                <Form fieldId="startDate" type="date" position={position} />
                                <p>
                                    <b>End Date: </b>
                                </p>
                                <Form fieldId="endDate" type="date" position={position} />
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
                                <InstructorForm
                                    courseId={position.id}
                                    instructors={[]} //position.instructors}
                                    instructor_data={instructors}
                                    {...this.props}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <ExpandableDescriptions
                    position={position}
                    expanded={this.state.expanded}
                    handleClick={this.toggleExpanded}
                />
            </ListGroupItem>
        )
    }
}

class ExpandableDescriptions extends React.Component {
    render() {
        const { position, expanded, handleClick } = this.props
        if (expanded) {
            return (
                <div>
                    <button className="expand-button" onClick={handleClick}>
                        <span className="fa fa-chevron-up" />
                    </button>
                    <Descriptions position={position} />
                </div>
            )
        } else {
            return (
                <div>
                    <button className="expand-button" onClick={handleClick}>
                        <span className="fa fa-chevron-down" />
                    </button>
                </div>
            )
        }
    }
}

const Descriptions = connect(
    null,
    { updatePositionValue }
)(({ position, updatePositionValue }) => (
    <table className="form-table">
        <tbody>
            <tr>
                <td className="col-half">
                    <p>
                        <b>Qualifications: </b>
                    </p>
                    <textarea
                        className="long-text"
                        onBlur={({ target: { value } }) =>
                            updatePositionValue({ positionId: position.id, fieldId: "qual", value })
                        }
                        defaultValue={position.qual}
                    />
                </td>
                <td className="col-half">
                    <p>
                        <b>Responsibilities: </b>
                    </p>
                    <textarea
                        className="long-text"
                        onBlur={({ target: { value } }) =>
                            updatePositionValue({ positionId: position.id, fieldId: "resp", value })
                        }
                        defaultValue={position.resp}
                    />
                </td>
            </tr>
        </tbody>
    </table>
))

// input that allows form submission
const Form = connect(
    null,
    { updatePositionValue }
)(({ position, fieldId, updatePositionValue, type }) => (
    <form>
        <input
            type={type}
            defaultValue={position[fieldId] !== undefined ? position[fieldId] : ""}
            onBlur={({ target: { value } }) =>
                updatePositionValue({ positionId: position.id, fieldId, value })
            }
        />
    </form>
))

class InstructorForm extends React.Component {
    alreadyAddedInstructor(id, instructors) {
        for (let i in instructors) {
            if (instructors[i] === id) {
                return true
            }
        }
        return false
    }

    isInstructor(input, course, instructors, instructor_data) {
        for (let i in instructor_data) {
            if (instructor_data[i] === input) {
                if (this.alreadyAddedInstructor(i, instructors)) {
                    this.props.alert("You've already added this instructor.")
                } else {
                    this.props.addInstructor(course, i)
                }
                this.input.value = ""
                break
            }
        }
    }

    render() {
        return (
            <div className="instructor-form" onClick={() => this.input.focus()}>
                {this.props.instructors.map((instructor, key) => (
                    <Badge key={key}>
                        {this.props.instructor_data[instructor]}
                        <button
                            onClick={() => this.props.removeInstructor(this.props.position.id, key)}
                        >
                            <i className="fa fa-close" />
                        </button>
                    </Badge>
                ))}
                <input
                    type="text"
                    list="instructors"
                    defaultValue=""
                    ref={input => {
                        this.input = input
                    }}
                    onInput={event =>
                        this.isInstructor(
                            event.target.value,
                            this.props.position.id,
                            this.props.instructors,
                            this.props.instructor_data
                        )
                    }
                />
                <datalist id="instructors">
                    {Object.entries(this.props.instructor_data).map((instructor, key) => (
                        <option key={key} value={instructor[1]} />
                    ))}
                </datalist>
            </div>
        )
    }
}

export default CourseForm
