import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { NavLink, Switch, Route } from "react-router-dom";

import "./main.css";
import "../../components/components.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav } from "react-bootstrap";
import { ToggleMockApi } from "./mockAPI";

import "swagger-ui-react/swagger-ui.css";
import { mockApiRoutesAsSwaggerPaths } from "../../api/defs/doc-generation";
import { mockAPI } from "../../api/mockAPI";
import {
    setMockAPIState,
    usersSelector,
    activeUserSelector,
    debugOnlySetActiveUser,
    debugOnlyFetchUsers,
    sessionsSelector,
    fetchSessions,
} from "../../api/actions";
import { ActiveUserButton } from "./active-user-switch";
import { SeedDataMenu } from "./load-mock-data";

// We don't need SwaggerUI all the time, so load it lazily.
const SwaggerUI = React.lazy(() => import("swagger-ui-react"));

/**
 * Wrap `"react-router-dom"`'s `NavLink` in Bootstrap
 * styling.
 *
 * @param {*} props
 * @returns
 */
function BootstrapNavLink(props) {
    return (
        <Nav.Link
            as={NavLink}
            activeClassName="bg-warning text-dark"
            to={props.to}
        >
            {props.children}
        </Nav.Link>
    );
}
BootstrapNavLink.propTypes = {
    to: PropTypes.string,
};

const swaggerData = {
    openapi: "3.0.0",
    info: {
        description:
            "TAPP is a program for TA management--for making TA assignments and distributing TA contracts.",
        title: "TAPP",
    },
    servers: [
        { url: "/api/v1/admin" },
        { url: "/api/v1/instructor" },
        { url: "/api/v1/ta" },
        { url: "/api/v1" },
        { url: "/" },
    ],
    paths: {
        /* XXX this is hear temporarily to serve as an example for generating Swagger (openapi) documentation
        "/bob": {
            get: {
                summary: "Bob's summary",
                tags: ["helpful"],
                produces: "application/json",
                responses: {
                    default: {
                        description: "OK",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            enum: ["success", "error"]
                                        },
                                        message: { type: "string" },
                                        payload: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    name: { type: "string" }
                                                },
                                                required: ["name"]
                                            }
                                        }
                                    },
                                    required: ["status"]
                                }
                            }
                        }
                    }
                }
            }
        },
*/
        ...mockApiRoutesAsSwaggerPaths(mockAPI),
    },
};

const ConnectedActiveUserButton = connect(
    (state) => ({
        activeUser: activeUserSelector(state),
        users: usersSelector(state),
    }),
    { fetchUsers: debugOnlyFetchUsers, setActiveUser: debugOnlySetActiveUser }
)(ActiveUserButton);

// When toggled, `ToggleMockApi` will try
// to refetch all the sessions, so pass it an
// appropriate dispatcher.
const ConnectedToggleMockApi = connect(null, { setMockAPIState })(
    ToggleMockApi
);

const ConnectedLoadMockButton = connect(
    (state) => ({ sessions: sessionsSelector(state) }),
    { fetchSessions }
)(SeedDataMenu);

function DevFrame(props) {
    return (
        <div id="dev-frame" className="bg-info">
            <div id="dev-frame-header">
                <Navbar expand variant="dark" className="px-2">
                    <Navbar.Brand
                        href="#/"
                        title="View TAPP in development mode in a framed window."
                    >
                        Dev Mode
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <BootstrapNavLink to="/api-docs">
                            API Docs
                        </BootstrapNavLink>
                    </Nav>
                    <Navbar.Collapse className="justify-content-end">
                        <ConnectedLoadMockButton />
                        <ConnectedActiveUserButton />
                        <ConnectedToggleMockApi />
                    </Navbar.Collapse>
                </Navbar>
            </div>
            <div id="dev-frame-body">
                <div id="dev-frame-body-inner">
                    <Switch>
                        <Route path="/api-docs">
                            <React.Suspense fallback="Loading...">
                                <SwaggerUI
                                    spec={swaggerData}
                                    docExpansion="list"
                                />
                            </React.Suspense>
                        </Route>
                        <Route>{props.children}</Route>
                    </Switch>
                </div>
            </div>
            <div id="dev-frame-footer"></div>
        </div>
    );
}

export { DevFrame };
