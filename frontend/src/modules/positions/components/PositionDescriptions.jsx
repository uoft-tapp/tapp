import React from "react"
import { connect } from "react-redux"
import { updatePositionValueRequest } from "../actions"

class Descriptions extends React.Component {
    state = { expanded: false }
    open = () => this.setState({ expanded: true })
    close = () => this.setState({ expanded: false })
    render() {
        const { position } = this.props
        if (this.state.expanded) {
            return (
                <div>
                    <button className="expand-button" onClick={this.close}>
                        <span className="fa fa-chevron-up" />
                    </button>
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
                                            updatePositionValueRequest({
                                                positionId: position.id,
                                                fieldId: "qual",
                                                value
                                            })
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
                                            updatePositionValueRequest({
                                                positionId: position.id,
                                                fieldId: "resp",
                                                value
                                            })
                                        }
                                        defaultValue={position.resp}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )
        } else {
            return (
                <div>
                    <button className="expand-button" onClick={this.open}>
                        <span className="fa fa-chevron-down" />
                    </button>
                </div>
            )
        }
    }
}

export default connect(
    null,
    { updatePositionValueRequest }
)(Descriptions)
