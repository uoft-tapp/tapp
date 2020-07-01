import React from "react";
import PropTypes from "prop-types";
import { Nav, Tab, Col, Row } from "react-bootstrap";
import { NavLink, Switch, Route } from "react-router-dom";

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

function Subroutes(props) {
    const { route, subroutes } = props;
    const buttons = (subroutes || []).map((subroute) => {
        const fullroute = `${route}${subroute.route}`;
        return (
            <BootstrapNavItem
                to={fullroute}
                title={subroute.description}
                key={fullroute}
                className="secondary"
            >
                <h5>
                    <small>{subroute.name}</small>
                </h5>
            </BootstrapNavItem>
        );
    });
    return () => <Nav variant="pills">{buttons}</Nav>;
}

function MainRoute(props) {
    const { route, routes = [], infoComponents = null } = props;

    const activeTabs = routes
        .filter((route) => route.hidden !== true)
        .map((route) => {
            return (
                <BootstrapNavItem
                    eventKey={route.route}
                    to={route.route}
                    key={route.route}
                    className="primary"
                >
                    <h5>{route.name}</h5>
                </BootstrapNavItem>
            );
        });

    return () => (
        <Tab.Container defaultActiveKey={route.route}>
            <Row className="justify-content-between pr-3 ">
                <Col md={"auto"}>
                    <Nav
                        className="flex-row pt-3 pr-3 pb-0 pl-2"
                        variant="tabs"
                    >
                        {activeTabs}
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
            <Row className="py-2 pr-3 pl-3">
                <Tab.Content>
                    <Switch>
                        {routes.map((route) => (
                            <Route
                                path={route.route}
                                component={Subroutes(route)}
                            />
                        ))}
                    </Switch>
                </Tab.Content>
            </Row>
        </Tab.Container>
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

    if (routes.length === 0) {
        return <div>No Routes in Header</div>;
    }

    return (
        <Switch>
            {routes.map((route) => (
                <Route
                    path={route.route}
                    component={MainRoute({ route, routes, infoComponents })}
                />
            ))}
        </Switch>
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
