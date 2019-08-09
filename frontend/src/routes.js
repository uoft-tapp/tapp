import Positions from "./modules/positions/components/index";
import Applicants from "./modules/applicants_by_course/components/index";
import RootRedirect from "./modules/auth/components/RootRedirect";
import Screen from "./modules/cp/components/index";
import NewPosition from "./modules/positions/components/NewPosition";
import AllAssigned from "./modules/all_applicants/components/AllAssigned";
import AllUnassigned from "./modules/all_applicants/components/AllUnassigned";
import Summary from "./modules/tapp_summary/components/Summary";
import ApplicationForm from "./modules/application/components/ApplicationForm";
import PositionsApplied from "./modules/applicants_positions/components/PositionsApplied";
import Dashboard from "./views/dashboard";
import ControlPanel from "./views/cp_control_panel/ControlPanel";
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
    },
    {
        path: "/dashboard",
        component: Dashboard
    },
    {
        path: "/application",
        component: ApplicationForm
    },
    {
        path: "/application/positionApplied",
        component: PositionsApplied
    },
    {
        path: "/cp/control_panel",
        component: ControlPanel
    }
];

export const privateRoutes = [];
