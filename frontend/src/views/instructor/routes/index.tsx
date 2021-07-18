import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { InstructorPositionsView } from "../positions";
import { InstructorAssignmentsView } from "../assignments";
import { Landing as InstructorLanding } from "../landing";

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
                Not Implemented
            </Route>
        </Switch>
    );
}
