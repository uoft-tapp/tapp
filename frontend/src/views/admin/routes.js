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
        route: "/appointments_positions",
        name: "Appointments & Positions",
        description: "Appointments & Positions",
        // hidden: true,
    },
];
