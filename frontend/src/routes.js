import Positions from "./modules/positions/components/index"
import Applicants from "./modules/applicants/components/index"
import RootRedirect from "./modules/auth/components/RootRedirect"
import Screen from "./modules/cp/components/index"

export const openRoutes = [
    {
        path: "/",
        component: RootRedirect
    },
    {
        path: "/tapp/positions",
        component: Positions
    },
    {
        path: "/tapp/applicants",
        component: Applicants
    },
    {
        path: "/cp",
        component: Screen
    }
]

export const privateRoutes = []
