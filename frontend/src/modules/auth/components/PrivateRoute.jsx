import React from "react";
import { connect } from "react-redux";
import { Route, Redirect } from "react-router-dom";

const PrivateRoute = connect(({ ui: { auth } }) => ({ auth }))(
    ({ component: Component, auth, ...rest }) => (
        <Route
            {...rest}
            render={props =>
                auth.isLoggedIn ? (
                    <Component {...props} />
                ) : (
                    <Redirect
                        to={{
                            pathname: "/",
                            state: { from: props.location }
                        }}
                    />
                )
            }
        />
    )
);

export default PrivateRoute;
