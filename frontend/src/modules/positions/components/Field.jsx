import React from "react"
import { connect } from "react-redux"
import { updatePositionValueRequest } from "../actions"

const getValue = ({ position, fieldId }) => position[fieldId]

class Field extends React.Component {
    state = { value: getValue(this.props) }
    handleChange = ({ target: { value } }) => this.setState({ value })
    handleBlur = () =>
        this.props.updatePositionValueRequest({
            positionId: this.props.position.id,
            fieldId: this.props.fieldId,
            value: this.state.value,
            defaultValue: getValue(this.props)
        })
    render() {
        return (
            <input
                type={this.props.type}
                value={this.state.value}
                onChange={this.handleChange}
                onBlur={this.handleBlur}
            />
        )
    }
}
export default connect(
    null,
    { updatePositionValueRequest }
)(Field)
