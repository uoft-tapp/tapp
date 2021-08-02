import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { InstructorAssignmentsView } from "../assignments";
import { Landing as InstructorLanding } from "../landing";
import { InstructorDdahsView } from "../ddahs";

export function InstructorRoutes() {
    return (
        <Switch>
            <Route exact path="/">
                <InstructorLanding />
            </Route>
            <Route path="/positions/:position_id/assignments">
                <InstructorAssignmentsView />
            </Route>
            <Route path="/positions/:position_id/ddahs">
                <InstructorDdahsView />
            </Route>
            <Redirect from="/positions/:position_id" to="/positions/:position_id/assignments" />;
        </Switch>
    );
}
