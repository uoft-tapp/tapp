import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import RedirectableNewPosition from "../new_position_form/fillablePosition";
import ApplicationForm from "../application_form/fillableApplication";
import ApplicantsByCourse from "../applicants_by_course";
import Dashboard from "../dashboard";
import ControlPanel from "../cp_control_panel/ControlPanel";

export function AdminRoutes() {
    return (
        <Switch>
            <Route exact path="/">
                <Redirect to="/tapp" />
            </Route>
            <Route exact path="/tapp/applicants">
                <ApplicantsByCourse />
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
