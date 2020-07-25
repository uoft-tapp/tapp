import React from "react";
import { Header } from "../../components/header";
import {
    ConnectedActiveSessionDisplay,
    ConnectedActiveUserDisplay,
} from "../header";

export const routes = [
    {
        route: "/session_setup",
        name: "Session Setup",
        description: "Setup a new session or manage an existing session.",
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
        ],
    },
    {
        route: "/assignments_and_positions",
        name: "Assignment & Positions",
        description: "Manage Assignments & Positions",
        subroutes: [
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
                route: "/ddahs",
                name: "DDAHs",
                description: "Manage DDAHs",
            },
        ],
    },
    {
        route: "/applicants_and_matching",
        name: "Applicants & Matching",
        description: "Manage applicants and match applicants to positions",
        subroutes: [
            {
                route: "/applicants",
                name: "Applicants",
                description: "Manage Applicants",
            },
        ],
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
