import React from "react"
import { connect } from "react-redux"
import { createNewPosition } from "../actions"
import { Grid, Col, Button } from "react-bootstrap"

const newPositionFields = [
    {
        label: "Course Code",
        value: "course_code"
    }
]

class NewPosition extends React.Component {
    state = newPositionFields.reduce((acc, cur) => ({ ...acc, [cur.value]: "" }), {})
    handleChange = prop => event => this.setState({ [prop]: event.target.value })
    handleSubmit = () => {
        this.props.createNewPosition(this.state)
    }
    render() {
        return (
            <Grid>
                <Col xs={8} xsOffset={2}>
                    <h2>New Position</h2>
                    {newPositionFields.map(({ label, value }) => (
                        <div key={value}>
                            <label>{label}</label>
                            <input value={this.state[value]} onChange={this.handleChange(value)} />
                        </div>
                    ))}
                    <Button bsStyle="primary" onClick={this.handleSubmit}>
                        Save
                    </Button>
                </Col>
            </Grid>
        )
    }
}

export default connect(
    null,
    { createNewPosition }
)(NewPosition)
