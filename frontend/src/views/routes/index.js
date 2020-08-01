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
import { AdminDdahsView } from "../ddahs";

export function AdminRoutes() {
    return (
        <Switch>
            <Route exact path="/">
                <Redirect to="/assignments_and_positions/assignments" />
            </Route>
            <Route exact path="/tapp">
                <Landing />
            </Route>
            <Route exact path="/session_setup">
                <Redirect to="/session_setup/sessions" />
            </Route>
            <Route exact path="/session_setup/sessions">
                <AdminSessionsView />
            </Route>
            <Route exact path="/session_setup/contract_templates">
                <AdminContractTemplatesView />
            </Route>
            <Route exact path="/session_setup/instructors">
                <AdminInstructorsView />
            </Route>
            <Route exact path="/assignments_and_positions">
                <Redirect to="/assignments_and_positions/positions" />
            </Route>
            <Route exact path="/assignments_and_positions/positions">
                <AdminPositionsView />
            </Route>
            <Route exact path="/assignments_and_positions/assignments">
                <AdminAssignmentsView />
            </Route>
            <Route exact path="/assignments_and_positions/ddahs">
                <AdminDdahsView />
            </Route>
            <Route exact path="/applicants_and_matching">
                <Redirect to="/applicants_and_matching/applicants" />
            </Route>
            <Route exact path="/applicants_and_matching/applicants">
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
