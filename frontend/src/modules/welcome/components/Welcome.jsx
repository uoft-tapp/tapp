import React from "react"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { login, logout } from "../../auth/actions"

class Welcome extends React.Component {
    changeLoginState = () => {
        if (this.props.auth.isLoggedIn) {
            this.props.logout()
        } else {
            this.props.login()
        }
    }
    render() {
        const { isLoggedIn } = this.props.auth
        return (
            <div>
                <h1>
                    Welcome, you are
                    {isLoggedIn ? "" : " not"} logged in.
                    <button onClick={this.changeLoginState}>
                        {isLoggedIn ? "Log out" : "Login"}
                    </button>
                </h1>
                {isLoggedIn && <Link to="/private">Go to Private Section</Link>}
            </div>
        )
    }
}

export default connect(
    ({ auth }) => ({ auth }),
    { login, logout }
)(Welcome)
