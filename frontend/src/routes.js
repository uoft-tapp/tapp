import Positions from "./modules/positions/components/index"
import Applicants from "./modules/applicants_by_course/components/index"
import RootRedirect from "./modules/auth/components/RootRedirect"
import Screen from "./modules/cp/components/index"
import NewPosition from "./modules/positions/components/NewPosition"
import AllAssigned from "./modules/all_applicants/components/AllAssigned"
import AllUnassigned from "./modules/all_applicants/components/AllUnassigned"
import Summary from "./modules/tapp_summary/components/Summary"

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
        path: "/tapp/assigned",
        component: AllAssigned
    },
    {
        path: "/tapp/unassigned",
        component: AllUnassigned
    },
    {
        path: "/tapp/summary",
        component: Summary
    },
    {
        path: "/cp",
        component: Screen
    }
]

export const privateRoutes = []
