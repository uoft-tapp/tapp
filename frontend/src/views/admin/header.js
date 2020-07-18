import React from "react";
import { Header } from "../../components/header";
import {
    ConnectedActiveSessionDisplay,
    ConnectedActiveUserDisplay,
} from "../header";

export const routes = [
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
            {
                route: "/applicants",
                name: "Applicants",
                description: "Manage Applicants",
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
                description: "See statistics about accepted/rejected contracts",
            },
        ],
    },
    {
        route: "/appointments_and_positions",
        name: "Appointments & Positions",
        description: "Appointments & Positions",
    },
];

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
                <ConnectedActiveSessionDisplay key={0} />,
                <ConnectedActiveUserDisplay key={1} />,
            ]}
        />
    );
}

export { AdminHeader };
