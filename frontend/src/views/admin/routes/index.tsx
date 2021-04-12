import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { AdminInstructorsView } from "../instructors";
import { AdminSessionsView } from "../sessions";
import { AdminPositionsView } from "../positions";
import { AdminAssignmentsView } from "../assignments";
import { AdminContractTemplatesView } from "../contract_template";
import { Landing } from "../admin-header/landing";
import { AdminApplicantsView } from "../applicants";
import { AdminDdahsView } from "../ddahs";
import { PostingOverview } from "../postings/overview";
import { PostingDetails } from "../postings/posting-details";
import { PostingPreview } from "../postings/posting-preview";
import { AdminApplicationsView } from "../applications";

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
            <Route exact path="/applicants_and_matching/applications">
                <AdminApplicationsView />
            </Route>
            <Route exact path="/postings">
                <Redirect to="/postings/overview" />
            </Route>
            <Route exact path="/postings/overview">
                <PostingOverview />
            </Route>
            <Route exact path="/postings/:posting_id/details">
                <PostingDetails />
            </Route>
            <Route exact path="/postings/:posting_id/preview">
                <PostingPreview />
            </Route>
        </Switch>
    );
}
