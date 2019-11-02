import React from "react";
import { Header } from "../../components/header";

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
                            route: "/positions/new",
                            name: "New Positions",
                            description: "Create New Positions"
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
        />
    );
}

export { AdminHeader };
