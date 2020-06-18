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

/**
 * Header showing the routes that a user with `role=admin`
 * can see.
 *
 * @returns
 */
function AdminHeader() {
    return (
        <Header
            routes={[
                {
                    route: "/tapp",
                    name: "Admin",
                    description: "Admin View",
                    subroutes: [
                        {
                            route: "/sessions",
                            name: "Sessions",
                            description: "Manage Sessions",
                        },
                        {
                            route: "/contract_templates",
                            name: "Contract Templates",
                            description: "Manage Contract Templates",
                        },
                        {
                            route: "/instructors",
                            name: "Instructors",
                            description: "Manage Instructors",
                        },
                        {
                            route: "/positions",
                            name: "Positions",
                            description: "Manage Positions",
                        },
                        {
                            route: "/assignments",
                            name: "Assignments",
                            description: "Manage Assignments",
                        },
                    ],
                },
                {
                    route: "/matching",
                    name: "Matching",
                    description: "Matching",
                    subroutes: [
                        {
                            route: "/statistics",
                            name: "Statistics",
                            description:
                                "See statistics about accepted/rejected contracts",
                        },
                    ],
                    // hidden: true,
                },
                {
                    route: "/appointments_and_positions",
                    name: "Appointments & Positions",
                    description: "Appointments & Positions",
                    hidden: true,
                },
            ]}
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
