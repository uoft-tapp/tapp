import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard";
import ControlPanel from "../cp_control_panel/ControlPanel";
import { AdminIstructorsView } from "../instructors";
import { AdminSessionsView } from "../sessions";
import { AdminPositionsView } from "../positions";
import { AdminAssignmentsView } from "../assignments";

export function AdminRoutes() {
    return (
        <Switch>
            <Route exact path="/">
                <Redirect to="/tapp" />
            </Route>
            <Route path="/tapp/sessions">
                <AdminSessionsView />
            </Route>
            <Route path="/tapp/instructors">
                <AdminIstructorsView />
            </Route>
            <Route exact path="/tapp/positions">
                <AdminPositionsView />
            </Route>
            <Route exact path="/tapp/assignments">
                <AdminAssignmentsView />
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
