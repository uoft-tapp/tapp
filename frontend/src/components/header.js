import React from "react";
import PropTypes from "prop-types";
import { Nav, Tab, Col, Row } from "react-bootstrap";
import { NavLink } from "react-router-dom";

/**
 * Wrap `"react-router-dom"`'s `NavLink` in Bootstrap
 * styling.
 *
 * @param {*} props
 * @returns
 */
export function BootstrapNavLink(props) {
    return (
        <Nav.Link as={NavLink} activeClassName="text-dark" {...props}>
            {props.children}
        </Nav.Link>
    );
}
BootstrapNavLink.propTypes = {
    to: PropTypes.string,
};

function BootstrapNavItem(props) {
    return (
        <Nav.Item>
            <BootstrapNavLink {...props} />
        </Nav.Item>
    );
}

/**
 * Render a header that dynamically adjusts depending on the route
 * (as determined by `react-router-dom`). Top-level routes appear in
 * a dropdown menu. Subroutes (which only show when the top-level route is active)
 * appear as a horizontal list. A toplevel route takes the form
 *
 * ```
 * {
 *    route: "/some/route"
 *    name: "Display Name"
 *    description: "Alt Text"
 *    subroutes: [<same as routes>]
 * }
 * ```
 *
 * `subroutes.route` is automatically prefixed with the parent's `route`.
 *
 * @export
 * @param {object[]} props.routes
 * @returns
 */

export function Header(props) {
    const { routes = [], infoComponents = null } = props;
    const [activeKey, setActiveKey] = React.useState(routes[0].route);

    if (routes.length === 0) {
        return <div>No Routes in Header</div>;
    }
    return (
        <Tab.Container activeKey={activeKey}>
            <Row className="justify-content-between right-padding">
                <Col md={"auto"}>
                    <Nav className="flex-row navbar-tabs" variant="tabs">
                        {routes.map((route) => (
                            <BootstrapNavItem
                                eventKey={route.route}
                                to={route.route}
                                key={route.route}
                                onSelect={(k) => setActiveKey(k)}
                            >
                                {route.name}
                            </BootstrapNavItem>
                        ))}
                    </Nav>
                </Col>
                <Col md={"auto"}>
                    <Row>
                        {infoComponents.map((component, index) => (
                            <div key={index}>{component}</div>
                        ))}
                    </Row>
                </Col>
            </Row>
            <Row className="navbar-subtabs">
                <Tab.Content>
                    <Nav variant="pills">
                        {routes
                            .filter((route) => route.route === activeKey)
                            .map((route) =>
                                (route.subroutes || []).map((subroute) => {
                                    const fullroute = `${route.route}${subroute.route}`;
                                    return (
                                        <BootstrapNavItem
                                            to={fullroute}
                                            title={subroute.description}
                                            key={fullroute}
                                        >
                                            {subroute.name}
                                        </BootstrapNavItem>
                                    );
                                })
                            )}
                    </Nav>
                </Tab.Content>
            </Row>
        </Tab.Container>
    );
}

Header.propTypes = {
    routes: PropTypes.arrayOf(
        PropTypes.shape({
            route: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string,
            subroutes: PropTypes.arrayOf(
                PropTypes.shape({
                    route: PropTypes.string.isRequired,
                    name: PropTypes.string.isRequired,
                    description: PropTypes.string,
                })
            ),
        })
    ),
    infoComponents: PropTypes.array,
};
