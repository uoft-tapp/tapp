import Positions from "./modules/positions/components/index"
import Applicants from "./modules/applicants/components/index"
import RootRedirect from "./modules/auth/components/RootRedirect"
import Screen from "./modules/cp/components/index"
import NewPosition from "./modules/positions/components/NewPosition"

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
        path: "/tapp/positions/new",
        component: NewPosition
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
