import React from "react";
import { Switch } from "react-router-dom";
import moment from "moment";
import CustomNotifications from "./modules/notifications/components/CustomNotifications";
import { openRoutes, privateRoutes } from "./routes";
import OpenRoute from "./modules/auth/components/OpenRoute";
import PrivateRoute from "./modules/auth/components/PrivateRoute";
import Header from "./modules/navigation/components/Header";
import { connect } from "react-redux";
import { setGlobals } from "./views/globals/actions";
import { parseURLSearchString } from "./libs/urlUtils";
import { runOnActiveSessionChange } from "./api/actions/utils";
import { setActiveSession } from "./api/actions";

class App extends React.Component {
    componentDidMount() {
        // Some special values can be persisted in the url search string.
        // This is mainly for development with the mockAPI so that a page
        // can be refreshed and appear in the same state that it was.
        if (!window.location) {
            return;
        }
        const newGlobals = parseURLSearchString(window.location.search);
        this.props.setGlobals(newGlobals);

        // Set up a special handler for when the active session changes. We want to store
        // this in the URL string
        runOnActiveSessionChange(() => async (dispatch, getState) => {
            const state = getState();
            const activeSession = state.model.sessions.activeSession;
            const globals = state.ui.globals;
            this.props.setGlobals({
                ...globals,
                activeSession: activeSession.id
            });
        });
        // If there is an `activeSession` stored in globals, use it to set the active
        // session now. (This is a one-time action)
        if (newGlobals.activeSession != null) {
            this.props.setActiveSession({ id: newGlobals.activeSession });
        }
    }

    render() {
        return (
            <React.Fragment>
                <Header />
                <Switch>
                    {openRoutes.map(route => (
                        <OpenRoute key={route.path} exact {...route} />
                    ))}
                    {privateRoutes.map(route => (
                        <PrivateRoute key={route.path} exact {...route} />
                    ))}
                </Switch>
                <CustomNotifications />
            </React.Fragment>
        );
    }
}

const ConnectedApp = connect(
    state => ({
        globals: state.ui.globals
    }),
    { setGlobals, setActiveSession }
)(App);

export default ConnectedApp;
