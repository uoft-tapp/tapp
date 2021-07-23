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
            <Route
                path="/:positionId"
                render={({match}) => {
                    const positionId = match.params.positionId;
                    return <Redirect to={`/${positionId}/assignments`} />;
                }}
            />
            <Route path="/:positionId/assignments">
                <InstructorAssignmentsView />
            </Route>
            <Route exact path="/tapp/ddahs">
                Not Implemented
            </Route>
        </Switch>
    );
}
