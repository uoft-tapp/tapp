import React from "react";
import { Header } from "../../components/header";
import {
    ConnectedActiveSessionDisplay,
    ConnectedActiveUserDisplay,
} from "../common/header-components";

export const routes = [
    {
        route: "/tapp",
        name: "Course Admin",
        description: "Administrate TAs in your courses",
        subroutes: [
            {
                route: "/positions",
                name: "Courses & Positions",
                description: "View your courses and positions",
            },
            {
                route: "/assignments",
                name: "TA Information",
                description: "View information about your TAs",
            },
            {
                route: "/ddahs",
                name: "DDAHs",
                description: "Manage your TAs' DDAH forms",
            },
        ],
    },
    {
        route: "/applications",
        name: "Applications",
        description: "View information about TAs applying to your course",
        subroutes: [
            {
                route: "/statistics",
                name: "Statistics",
                description: "See statistics about accepted/rejected contracts",
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
export function InstructorHeader() {
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
