import React from "react";
import { connect } from "react-redux";

import "./main.css";
import { Navbar, Nav } from "react-bootstrap";
import { ToggleMockApi } from "../../components/mockAPI";
import { fetchSessions } from "../../api/actions";

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
                        href="#"
                        title="View TAPP in development mode in a framed window."
                    >
                        Dev Mode
                    </Navbar.Brand>
                    <Nav className="mr-auto">
                        <Nav.Link>API Docs</Nav.Link>
                    </Nav>
                    <Navbar.Collapse className="justify-content-end">
                        <ConnectedToggleMockApi />
                    </Navbar.Collapse>
                </Navbar>
            </div>
            <div id="dev-frame-body">
                <div id="dev-frame-body-inner">{props.children}</div>
            </div>
            <div id="dev-frame-footer"></div>
        </div>
    );
}

export { DevFrame };
