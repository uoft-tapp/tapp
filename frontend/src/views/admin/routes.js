export const routes = [
    {
        route: "/tapp",
        name: "Admin",
        description: "TAPP Main View",
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
                route: "/summary",
                name: "Summary",
                description: "Overivew of all data",
            },
        ],
    },
    {
        route: "/cp", //TODO: route doesn't exist
        name: "CP",
        description: "Matching", //TODO: better desc
        subroutes: [
            {
                route: "/statistics",
                name: "Statistics",
                description: "See statistics about accepted/rejected contracts",
            },
        ],
    },
    {
        route: "/dashboard",
        name: "Dashboard",
        description: "Applications and Postings",
    },
];
