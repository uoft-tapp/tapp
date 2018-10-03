import React from "react"
import { Link } from "react-router-dom"

class Private extends React.Component {
    state = { name: "" }
    handleChange = prop => event => this.setState({ [prop]: event.target.value })
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
                <label>Name</label>
                <input value={this.state.name} onChange={this.handleChange("name")} />
            </div>
        )
    }
}

export default Private
