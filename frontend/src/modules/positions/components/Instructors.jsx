import React from "react"
import { Badge } from "react-bootstrap"

class Instructors extends React.Component {
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

export default Instructors
