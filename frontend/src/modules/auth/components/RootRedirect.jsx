import React from "react"
import { Redirect } from "react-router-dom"

class RootRedirect extends React.Component {
    render() {
        return <Redirect to="/tapp" />
    }
}

export default RootRedirect
