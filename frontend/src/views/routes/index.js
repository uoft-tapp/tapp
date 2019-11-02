import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import RedirectableNewPosition from "../new_position_form/fillablePosition";
import ApplicationForm from "../application_form/fillableApplication";
import Dashboard from "../dashboard";
import ControlPanel from "../cp_control_panel/ControlPanel";
import { AdminIstructorsView } from "../instructors";
import { AdminSessionsView } from "../sessions";

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
            <Route exact path="/tapp/positions/new">
                <RedirectableNewPosition />
            </Route>
            <Route exact path="/application">
                <ApplicationForm />
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
