import React from "react"
import { connect } from "react-redux"
import { createNewPosition } from "../actions"
import { fetchInstructors } from "../../instructors/actions"
import { Grid, Col, Button } from "react-bootstrap"
import moment from "moment"

const toNames = ({ first_name, last_name }) => `${first_name} ${last_name}`

const validNumber = val => (val && isNaN(val) ? "Not a valid number" : false)
const validDate = val =>
    (val && moment(val, "YYYY-MM-DD", true).isValid()) || val === '' ? false : "Not a valid date"
// check for format XXX123H1
const validCourseCode = val => {
    val = val.toUpperCase()
    if (val.length === 8 && isNaN(val.slice(0, 3)) 
        && !isNaN(val.slice(3, 6))
        && (val[6] === 'H' || val[6] === 'Y')
        && !isNaN(val[7])) {
        return false
    } else {
        return "Not a valid course code"
    }
}
const validInstructor = (val, props) => {
    const instructors = props.instructors.map(toNames)
    return (instructors.indexOf(val) !== -1 ? false : "Not a valid instructor")
}

const newPositionFields = [
    { label: "Course Code", value: "course_code", validate: [validCourseCode], required: true },
    { label: "Course Name", value: "course_name", validate:[], required: false },
    { label: "Current Enrolment", value: "cap_enrolment", validate: [validNumber], required: false },
    { label: "Duties", value: "duties", validate: [], required: false },
    { label: "Qualifications", value: "qualifications", validate:[], required: false },
    { label: "Instructor", value: "instructor", validate: [validInstructor], required: true },
    { label: "Round", value: "round_id", validate: [validNumber], required: true },
    { label: "Hours", value: "hours", validate:[validNumber], required: false },
    { label: "Openings", value: "openings", validate: [validNumber], required: true },
    { label: "Start Date", value: "start_date", validate: [validDate], required: false },
    { label: "End Date", value: "end_date", validate: [validDate], required: false }
]

const DefaultInput = ({ label, curValue, onChange, required }) => <div>
    <label style={{ width: "100px" }}>{required ? label + '*' : label}</label>
    <input value={curValue} onChange={onChange} required={required} />
</div>

const TextboxInput = ({ label, curValue, onChange, required }) => <div>
    <label style={{ width: "100px" }}>{required ? label + '*' : label}</label>
    <textarea style={{ width: "152px" }} 
              value={curValue} 
              onChange={onChange} 
              required={required}/>
</div>

const InstructorInput = ({ curValue, label, onChange, required }) => <div>
        <label style={{ width: "100px" }}>{required ? label + '*' : label}</label>
        <input value={curValue} 
               onChange={onChange} 
               required={required} />
    </div>

const InstructorList = ({ curValue, instructors, setInstructor }) => {
    const valid = validInstructor(curValue, { instructors })
    // console.log(thing, curValue, instructors)
    const matchingInstructors = instructors.map(({ first_name, last_name }) => `${first_name} ${last_name}`).filter((name) => name.toLowerCase().indexOf(curValue.toLowerCase()) !== -1)
    return <div>
        {!!valid && <ul>
            {matchingInstructors.map((i) => <li onClick={() => setInstructor(i)} key={i}>{i}</li>)}
        </ul>}
    </div>
}
const initialState = { ...newPositionFields.reduce((acc, cur) => ({ ...acc, [cur.value]: "" }), {}) }

class NewPosition extends React.Component {
    componentDidMount() {
        this.props.fetchInstructors()
    }
    state = { ...initialState }
    handleChange = prop => event => this.setState({ [prop]: event.target.value })

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.createNewPosition(this.state)
    }
    getInvalid = () =>
        newPositionFields.reduce((acc, cur) => {
            if (acc) {
                return acc
            }
            const errorMessage = cur.validate.reduce(
                (running, validator) => running || validator(this.state[cur.value], this.props),
                false
            )
            return errorMessage ? `${cur.label}: ${errorMessage}` : acc
        }, false)
    setInstructor = name => this.setState({ instructor: name })
    
    render() {
        const invalid = this.getInvalid()
        return (
            <Grid>
                <Col xs={8} xsOffset={2}>
                    <h2>New Position</h2>
                    <form onSubmit={this.handleSubmit}>
                        {newPositionFields.map(({ value, label, required }) => {
                            switch (value) {
                                case 'instructor':
                                    return <div>
                                            <InstructorInput 
                                                curValue={this.state[value]} 
                                                required={required}
                                                key={label} 
                                                label={label} 
                                                value={value} 
                                                onChange={this.handleChange(value)}
                                                />
                                            { this.state.instructor !== '' &&
                                            <InstructorList 
                                                curValue={this.state[value]} 
                                                setInstructor={this.setInstructor} 
                                                key='instructorList' 
                                                instructors={this.props.instructors} /> }
                                        </div>

                                case 'qualifications':              
                                case 'duties':
                                    return <TextboxInput 
                                        curValue={this.state[value]} 
                                        key={label} 
                                        label={label} 
                                        value={value} 
                                        required={required}
                                        onChange={this.handleChange(value)} 
                                    />
                                default:
                                    return <DefaultInput 
                                        curValue={this.state[value]} 
                                        key={label} 
                                        label={label} 
                                        value={value} 
                                        required={required}
                                        onChange={this.handleChange(value)} 
                                    />
                            }
                        })}
                        <br />
                        <Button bsStyle="primary" disabled={!!invalid} type='submit'>
                            {invalid || "Save Changes"}
                        </Button>
                    </form>
                </Col>
            </Grid>
        )
    }
}

export default connect(
    ({ instructors: { list } }) => ({
        instructors: list
    }),
    { createNewPosition, fetchInstructors }
)(NewPosition)
