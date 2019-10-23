import React from "react";
import { connect } from "react-redux";
import { setGlobals } from "./views/globals/actions";
import { parseURLSearchString } from "./libs/urlUtils";
import { runOnActiveSessionChange } from "./api/actions/utils";
import { setActiveSession } from "./api/actions";
import { ConnectedNotifications } from "./views/notificatons";
import { AdminRoutes } from "./views/routes";
import { AdminHeader } from "./views/admin";

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
                <AdminHeader />
                <AdminRoutes />
                <ConnectedNotifications />
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
