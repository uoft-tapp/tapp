import React from "react";
import { Route, Switch } from "react-router-dom";
import { ContractView } from "../contracts";
import { PostingView } from "../postings";

export function PublicRoutes() {
    return (
        <Switch>
            <Route path="/public/contracts/:url_token">
                <ContractView />
            </Route>
            <Route path="/public/postings/:url_token">
                <PostingView />
            </Route>
        </Switch>
    );
}
