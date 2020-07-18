import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { AdminInstructorsView } from "../instructors";
import { AdminSessionsView } from "../sessions";
import { AdminPositionsView, InstructorPositionsView } from "../positions";
import {
    AdminAssignmentsView,
    InstructorAssignmentsView,
} from "../assignments";
import { AdminContractTemplatesView } from "../contract_template";
import { Landing } from "../admin/landing.tsx";
import { Landing as InstructorLanding } from "../instructor/landing.tsx";
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
        </Switch>
    );
}

export function InstructorRoutes() {
    return (
        <Switch>
            <Route exact path="/">
                <Redirect to="/tapp" />
            </Route>
            <Route exact path="/tapp">
                <InstructorLanding />
            </Route>
            <Route exact path="/tapp/positions">
                <InstructorPositionsView />
            </Route>
            <Route exact path="/tapp/assignments">
                <InstructorAssignmentsView />
            </Route>
            <Route exact path="/tapp/ddahs">
                <div>Not implemented yet</div>
            </Route>
        </Switch>
    );
}
