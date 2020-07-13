import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard";
import ControlPanel from "../cp_control_panel/ControlPanel";
import { AdminInstructorsView } from "../instructors";
import { AdminSessionsView } from "../sessions";
import { AdminPositionsView } from "../positions";
import { AdminAssignmentsView } from "../assignments";
import { AdminContractTemplatesView } from "../contract_template";
import { Landing } from "../admin/landing.tsx";
import { AdminApplicantsView } from "../applicants";

export function AdminRoutes() {
    return (
        <Switch>
            <Route exact path="/">
                <Redirect to="/tapp" />
            </Route>
            <Route exact path="/tapp">
                <Landing />
            </Route>
            <Route exact path="/tapp/sessions">
                <AdminSessionsView />
            </Route>
            <Route exact path="/tapp/contract_templates">
                <AdminContractTemplatesView />
            </Route>
            <Route exact path="/tapp/instructors">
                <AdminInstructorsView />
            </Route>
            <Route exact path="/tapp/positions">
                <AdminPositionsView />
            </Route>
            <Route exact path="/tapp/assignments">
                <AdminAssignmentsView />
            </Route>
            <Route exact path="/tapp/applicants">
                <AdminApplicantsView />
            </Route>
            <Route exact path="/dashboard">
                <Dashboard />
            </Route>
            <Route exact path="/cp">
                <ControlPanel />
            </Route>
        </Switch>
    );
}
