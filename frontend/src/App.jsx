import React from "react";
import { connect } from "react-redux";
import { parseURLSearchString } from "./libs/urlUtils";
import { initFromStage } from "./api/actions";
import { ConnectedNotifications } from "./views/notificatons";
import { AdminRoutes } from "./views/routes";
import { AdminHeader } from "./views/admin";
import { globalsSelector } from "./api/actions/globals";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

class App extends React.Component {
    componentDidMount() {
        // Some special values can be persisted in the url search string.
        // This is mainly for development with the mockAPI so that a page
        // can be refreshed and appear in the same state that it was.
        if (!window.location) {
            return;
        }
        const newGlobals = parseURLSearchString(window.location.search);

        // If there is an `activeSession` stored in globals, use it to set the active
        // session now. (This is a one-time action)
        if (newGlobals.activeSession != null) {
            // If the mockAPI is enabled, we need to let it get set up
            // before we attempt to fetch a bunch of data. Therefore,
            // we do a `setTimeout`
            const options = {
                activeSession: { id: newGlobals.activeSession },
                mockAPI: newGlobals.mockAPI
            };

            window.setTimeout(() => {
                this.props.initFromStage("toggleMockAPI", options);
            }, 0);
        }
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
    state => ({
        globals: globalsSelector(state)
    }),
    { initFromStage }
)(App);

export default ConnectedApp;
