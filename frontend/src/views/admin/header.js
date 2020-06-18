import React from "react";
import { Header } from "../../components/header";
import { connect } from "react-redux";
import {
    sessionsSelector,
    activeSessionSelector,
    setActiveUserRole,
    setActiveSession,
    activeUserSelector,
    activeRoleSelector,
} from "../../api/actions";
import { ActiveUserDisplay } from "../../components/active-user";
import { ActiveSessionDisplay } from "../../components/active-session";
import { routes } from "./routes";
/**
 * Header showing the routes that a user with `role=admin`
 * can see.
 *
 * @returns
 */
function AdminHeader() {
    return (
        <Header
            routes={routes}
            infoComponents={[
                <ConnectedActiveSessionDisplay />,
                <ConnectedActiveUserDisplay />,
            ]}
        />
    );
}

const mapSessionsStateToProps = (state) => ({
    sessions: sessionsSelector(state),
    activeSession: activeSessionSelector(state),
});

const mapSessionsDispatchToProps = { setActiveSession };

const ConnectedActiveSessionDisplay = connect(
    mapSessionsStateToProps,
    mapSessionsDispatchToProps
)(ActiveSessionDisplay);

const mapActiveUserStateToProps = (state) => ({
    activeUser: activeUserSelector(state),
    activeRole: activeRoleSelector(state),
});

const mapActiveUserDispatchToProps = { setActiveUserRole };

const ConnectedActiveUserDisplay = connect(
    mapActiveUserStateToProps,
    mapActiveUserDispatchToProps
)(ActiveUserDisplay);

export { AdminHeader };
