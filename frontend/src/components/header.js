import React from "react";
import PropTypes from "prop-types";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Route, NavLink } from "react-router-dom";

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
    to: PropTypes.string
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
    const { routes = [], infoComponent = null } = props;

    if (routes.length === 0) {
        return <div>No Routes in Header</div>;
    }

    return (
        <Navbar bg="light" variant="light">
            <Navbar.Brand>
                <NavDropdown
                    title={routes.map(route => (
                        <Route path={route.route} key={route.route}>
                            {route.name}
                        </Route>
                    ))}
                >
                    {routes
                        .filter(route => !route.hidden)
                        .map(route => (
                            <NavDropdown.Item
                                key={route.route}
                                as="span"
                                tabIndex="0"
                            >
                                <BootstrapNavLink
                                    to={route.route}
                                    title={route.description}
                                >
                                    {route.name}
                                </BootstrapNavLink>
                            </NavDropdown.Item>
                        ))}
                </NavDropdown>
            </Navbar.Brand>
            <Nav className="mr-auto">
                {routes.map(route => (
                    <Route path={route.route} key={route.route}>
                        {(route.subroutes || []).map(subroute => {
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
            {infoComponent}
        </Navbar>
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
                    description: PropTypes.string
                })
            )
        })
    ),
    infoComponent: PropTypes.node
};
