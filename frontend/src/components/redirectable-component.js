import React from "react";
import { Redirect } from "react-router-dom";

export function RedirectableComponent(props) {
    const { component, route, ...rest } = props;
    const [shouldRedirect, setShouldRedirect] = React.useState(false);
    const Component = component;

    function enableRedirect() {
        setShouldRedirect(true);
    }

    if (shouldRedirect) {
        return <Redirect route={route} />;
    } else {
        return <Component enableRedirect={enableRedirect} {...rest} />;
    }
}
