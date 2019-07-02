<<<<<<< HEAD
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
=======
import Positions from "./modules/positions/components/index"
import Applicants from "./modules/applicants_by_course/components/index"
import RootRedirect from "./modules/auth/components/RootRedirect"
import Screen from "./modules/cp/components/index"
import NewPosition from "./modules/positions/components/NewPosition"
import AllAssigned from "./modules/all_applicants/components/AllAssigned"
import AllUnassigned from "./modules/all_applicants/components/AllUnassigned"
import Summary from "./modules/tapp_summary/components/Summary"
import ApplicationForm from "./modules/application/components/ApplicationForm"
import PositionsApplied from "./modules/application/components/PositionsApplied"
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> refactor(frontend) move components from applicants_positions to applicants
=======
>>>>>>> refactor(frontend) move components from applicants_positions to applicants
=======
>>>>>>> cb8e20f819c3c4e9ec4958ca0109b11e597bb6e7

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
        path: "/applicant/form",
        component: ApplicationForm
    },
    {
        path: "/applicant/positions",
        component: PositionsApplied
    }
];

export const privateRoutes = [];
