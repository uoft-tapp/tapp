import React from "react"
import { Link } from "react-router-dom"

class Private extends React.Component {
    render() {
        return (
            <div>
                <h1>Private!!!</h1>
                <Link to="/">Return to the Welcome Page</Link>
            </div>
        )
    }
}

export default Private
