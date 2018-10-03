import React from "react"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { submitForm } from "../actions"

const initialState = { name: "" }

class Private extends React.Component {
    state = { ...initialState }
    handleChange = prop => event => this.setState({ [prop]: event.target.value })
    handleSubmit = event => {
        event.preventDefault()
        this.props.submitForm(this.state)
        this.setState({ ...initialState })
    }
    render() {
        return (
            <div>
                <h1>
                    Private
                    {this.state.name.length > 0 ? ` area for ${this.state.name}` : ""}
                    !!!
                </h1>
                <Link to="/">Return to the Welcome Page</Link>
                <h2>Form:</h2>
                <form onSubmit={this.handleSubmit}>
                    <label>Name</label>
                    <input
                        type="text"
                        value={this.state.name}
                        onChange={this.handleChange("name")}
                    />
                    <input type="submit" />
                </form>
            </div>
        )
    }
}

export default connect(
    null,
    { submitForm }
)(Private)
