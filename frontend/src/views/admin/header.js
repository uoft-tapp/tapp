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
        />
    );
}

export { AdminHeader };
