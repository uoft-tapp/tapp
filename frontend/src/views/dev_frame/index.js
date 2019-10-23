import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { NavLink, Switch, Route } from "react-router-dom";

import "./main.css";
import { Navbar, Nav } from "react-bootstrap";
import { ToggleMockApi } from "../../components/mockAPI";
import { fetchSessions } from "../../api/actions";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { mockApiRoutesAsSwaggerPaths } from "../../api/defs/doc-generation";
import { mockAPI } from "../../api/mockAPI";

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
    to: PropTypes.string
};

const swaggerData = {
    openapi: "3.0.0",
    info: {
        description:
            "TAPP is a program for TA management--for making TA assignments and distributing TA contracts.",
        title: "TAPP"
    },
    host: "localhost:8000",
    basePath: "/v1/api",
    paths: {
        /* XXX this is hear temporarily to serve as an example for generating Swagger (openapi) documenation
        "/bob": {
            get: {
                summary: "Bob's summary",
                tags: ["helful"],
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
        ...mockApiRoutesAsSwaggerPaths(mockAPI)
    }
};

// When toggled, `ToggleMockApi` will try
// to refetch all the sessions, so pass it an
// appropriate dispatcher.
const ConnectedToggleMockApi = connect(
    null,
    { fetchSessions }
)(ToggleMockApi);

function DevFrame(props) {
    return (
        <div id="dev-frame" className="bg-info">
            <div id="dev-frame-header">
                <Navbar expand variant="dark">
                    <Navbar.Brand
                        href="#/"
                        title="View TAPP in development mode in a framed window."
                    >
                        Dev Mode
                    </Navbar.Brand>
                    <Nav className="mr-auto">
                        <BootstrapNavLink to="/dashboard">
                            Dashboard
                        </BootstrapNavLink>
                    </Nav>
                    <Nav className="mr-auto">
                        <BootstrapNavLink to="/api-docs">
                            API Docs
                        </BootstrapNavLink>
                    </Nav>
                    <Navbar.Collapse className="justify-content-end">
                        <ConnectedToggleMockApi />
                    </Navbar.Collapse>
                </Navbar>
            </div>
            <div id="dev-frame-body">
                <div id="dev-frame-body-inner">
                    <Switch>
                        <Route path="/api-docs">
                            <SwaggerUI spec={swaggerData} docExpansion="list" />
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
