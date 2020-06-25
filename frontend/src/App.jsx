import React from "react";
import { connect } from "react-redux";
import { initFromStage } from "./api/actions";
import { ConnectedNotifications } from "./views/notificatons";
import { AdminRoutes } from "./views/routes";
import { AdminHeader } from "./views/admin";
import { globalsSelector } from "./api/actions/globals";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

class App extends React.Component {
    componentDidMount() {
        this.props.initFromStage("pageLoad");
    }

    render() {
        return (
            <React.Fragment>
                <AdminHeader />
                <AdminRoutes />
                <ConnectedNotifications />
            </React.Fragment>
        );
    }
}

const ConnectedApp = connect(
    (state) => ({
        globals: globalsSelector(state),
    }),
    { initFromStage }
)(App);

export default ConnectedApp;
