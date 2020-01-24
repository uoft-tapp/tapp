import React from "react";
import { Header } from "../../components/header";
import { connect } from "react-redux";
import {
    initFromStage,
    usersSelector,
    sessionsSelector,
    activeSessionSelector
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
                    name: "TAPP",
                    description: "TAPP Main View",
                    subroutes: [
                        {
                            route: "/sessions",
                            name: "Sessions",
                            description: "Manage Sessions"
                        },
                        {
                            route: "/contract_templates",
                            name: "Contract Templates",
                            description: "Manage Contract Templates"
                        },
                        {
                            route: "/instructors",
                            name: "Instructors",
                            description: "Manage Instructors"
                        },
                        {
                            route: "/positions",
                            name: "Positions",
                            description: "Manage Positions"
                        },
                        {
                            route: "/assignments",
                            name: "Assignments",
                            description: "Manage Assignments"
                        },
                        {
                            route: "/summary",
                            name: "Summary",
                            description: "Overivew of all data"
                        }
                    ]
                },
                {
                    route: "/cp",
                    name: "CP",
                    description: "Contract Presentment",
                    subroutes: [
                        {
                            route: "/statistics",
                            name: "Statistics",
                            description:
                                "See statistics about accepted/rejected contracts"
                        }
                    ]
                },
                {
                    route: "/dashboard",
                    name: "Dashboard",
                    description: "List of all widgets",
                    hidden: true
                }
            ]}
            infoComponents={[
                <ConnectedActiveSessionDisplay />,
                <ConnectedActiveUserDisplay />
            ]}
        />
    );
}

const mapSessionsStateToProps = state => ({
    sessions: sessionsSelector(state),
    activeSession: activeSessionSelector(state)
});

const mapSessionsDispatchToProps = { initFromStage };

const ConnectedActiveSessionDisplay = connect(
    mapSessionsStateToProps,
    mapSessionsDispatchToProps
)(ActiveSessionDisplay);

const mapActiveUserStateToProps = state => ({
    activeUser: usersSelector(state).active_user,
    activeRole: usersSelector(state).active_role
});

const mapActiveUserDispatchToProps = { initFromStage };

const ConnectedActiveUserDisplay = connect(
    mapActiveUserStateToProps,
    mapActiveUserDispatchToProps
)(ActiveUserDisplay);

export { AdminHeader };
