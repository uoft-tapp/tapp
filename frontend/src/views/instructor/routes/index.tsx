import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { InstructorAssignmentsView } from "../assignments";
import { Landing as InstructorLanding } from "../landing";

export function InstructorRoutes() {
    return (
        <Switch>
            <Route exact path="/">
                <InstructorLanding />
            </Route>
            <Route path="/:positionId/assignments">
                <InstructorAssignmentsView />
            </Route>
            <Route path="/:positionId/ddahs">
                Not Implemented
            </Route>
            <Redirect from='/:positionId' to='/:positionId/assignments' />;
        </Switch>
    );
}
