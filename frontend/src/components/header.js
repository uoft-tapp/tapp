import React from "react";
import PropTypes from "prop-types";
import { Nav, Navbar } from "react-bootstrap";
import { NavLink, useRouteMatch } from "react-router-dom";

import "./components.css";

/**
 * Wrap `"react-router-dom"`'s `NavLink` in Bootstrap
 * styling.
 *
 * @param {*} props
 * @returns
 */
function BootstrapNavItem(props) {
    return (
        <Nav.Item>
            <Nav.Link as={NavLink} {...props}>
                {props.children}
            </Nav.Link>
        </Nav.Item>
    );
}
BootstrapNavItem.propTypes = {
    to: PropTypes.string,
};

/**
 * Render a header that dynamically adjusts depending on the route
 * (as determined by `react-router-dom`). Top-level routes appear in
 * a dropdown menu. Subroutes (which only show when the top-level route is active)
 * appear as a horizontal list. A top-level route takes the form
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
    const { routes = [], infoComponents = [] } = props;
    let match = useRouteMatch("/:mainRoute/:subRoute?") || {
        params: { mainRoute: "tapp" },
    };
    const { mainRoute } = match.params;

    if (routes.length === 0) {
        return <div>No Routes in Header</div>;
    }

    const activeMainRoutes = routes.map((route) => (
        <BootstrapNavItem
            eventKey={route.route}
            to={route.route}
            key={route.route}
            className="primary"
        >
            {route.name}
        </BootstrapNavItem>
    ));

    // filters the routes to include only the current route, then maps all of that route's subroutes to BootstrapNavItems
    const availableSubroutes = routes
        .filter((route) => route.route.substring(1) === mainRoute)
        .map((route) =>
            (route.subroutes || []).map((subroute) => {
                const fullroute = `${route.route}${subroute.route}`;
                return (
                    <BootstrapNavItem
                        to={fullroute}
                        title={subroute.name}
                        key={fullroute}
                        className="secondary"
                    >
                        {subroute.name}
                    </BootstrapNavItem>
                );
            })
        );

    return (
        <div className="header-container">
            <div className="header-nav">
                <Navbar>
                    <Nav
                        activeKey={mainRoute}
                        defaultActiveKey={"tapp"}
                        className="primary-nav-links"
                    >
                        {activeMainRoutes}
                    </Nav>
                </Navbar>
                <Nav className="secondary-nav-links">{availableSubroutes}</Nav>
            </div>
            <div className="header-widgets">{infoComponents}</div>
        </div>
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
