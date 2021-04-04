import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { ContractView } from "../contracts";

export function PublicRoutes() {
    return (
        <Switch>
            <Route path="/public/contracts/:url_token">
                <ContractView />
            </Route>
            <Route path="/public/postings/:url_token">View the posting</Route>
        </Switch>
    );
}
