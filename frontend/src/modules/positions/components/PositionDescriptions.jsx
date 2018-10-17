import React from "react"
import { Field } from "redux-form"

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
                                    <Field
                                        name={`positions.${position.id}.qual`}
                                        component="textarea"
                                        className="long-text"
                                    />
                                </td>
                                <td className="col-half">
                                    <p>
                                        <b>Responsibilities: </b>
                                    </p>
                                    <Field
                                        name={`positions.${position.id}.resp`}
                                        component="textarea"
                                        className="long-text"
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

export default Descriptions
