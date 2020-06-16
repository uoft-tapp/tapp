import React from "react";
import PropTypes from "prop-types";
import { Nav, Tab, Col, Row } from "react-bootstrap";
import { Route, NavLink } from "react-router-dom";
import Logo from "../res/logo.png";

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
    const [key, setKey] = React.useState(routes[0].route);

    if (routes.length === 0) {
        return <div>No Routes in Header</div>;
    }
    return (
        <Tab.Container
            activeKey={key}
            onSelect={(k) => {
                setKey(k);
            }}
        >
            <Row>
                <Col sm={9}>
                    <Nav className="flex-row navbar-tabs">
                        {routes.map((route) => (
                            <Nav.Item>
                                <BootstrapNavLink
                                    eventKey={route.route}
                                    to={route.route}
                                >
                                    {route.name}
                                </BootstrapNavLink>
                            </Nav.Item>
                        ))}
                    </Nav>
                </Col>
                <Col sm={3}>
                    <Row>
                        {infoComponents.map((component, index) => (
                            <div key={index}>{component}</div>
                        ))}
                    </Row>
                </Col>
                <Tab.Content>
                    <Nav>
                        {routes
                            .filter((route) => route.route === key)
                            .map((route) => (
                                <Route path={route.route} key={route.route}>
                                    {(route.subroutes || []).map((subroute) => {
                                        const fullroute = `${route.route}${subroute.route}`;
                                        return (
                                            <BootstrapNavLink
                                                to={fullroute}
                                                key={fullroute}
                                                title={subroute.description}
                                            >
                                                {subroute.name}
                                            </BootstrapNavLink>
                                        );
                                    })}
                                </Route>
                            ))}
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
