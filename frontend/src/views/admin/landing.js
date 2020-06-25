import React from "react";
import { connect } from "react-redux";
import { Jumbotron, Button, Accordion, Card } from "react-bootstrap";
import {
    sessionsSelector,
    activeSessionSelector,
    setActiveSession,
} from "../../api/actions";
import { ActiveSessionDisplay } from "../../components/active-session";

import { routes } from "./header";

function AccordionItem(route) {
    return (
        <Card>
            <Card.Header>
                <Accordion.Toggle
                    as={Button}
                    variant="link"
                    eventKey={route.route}
                >
                    <strong>{route.name}</strong>
                </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey={route.route}>
                <Card.Body>
                    <Accordion>
                        {(route.subroutes || []).map((subroute) => {
                            const fullroute = `${route.route}${subroute.route}`;
                            return (
                                <Card>
                                    <Card.Header>
                                        <Accordion.Toggle
                                            as={Button}
                                            variant="link"
                                            eventKey={fullroute}
                                            key={fullroute}
                                        >
                                            {subroute.name}
                                        </Accordion.Toggle>
                                    </Card.Header>
                                    <Accordion.Collapse eventKey={fullroute}>
                                        <Card.Body>
                                            {subroute.description}
                                        </Card.Body>
                                    </Accordion.Collapse>
                                </Card>
                            );
                        })}
                    </Accordion>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}

function NoActiveSessionJumbotron(setLearnMore) {
    return (
        <Jumbotron>
            <h1>Welcome to TAPP!</h1>
            <p>
                There is <strong>no active session</strong> selected.
            </p>
            <p>
                Choose an active session from the selected session menu below.
            </p>
            <ConnectedActiveSessionDisplay />
            <p>
                <Button variant="primary" onClick={() => setLearnMore(true)}>
                    Learn more about TAPP
                </Button>
            </p>
        </Jumbotron>
    );
}

function LearnMoreJumbotron(routes) {
    return (
        <Jumbotron>
            <h1>Welcome to TAPP!</h1>
            <p>Expand any item below to learn more:</p>
            <p>
                <Accordion>
                    {routes.map((route) => AccordionItem(route))}
                </Accordion>
            </p>
        </Jumbotron>
    );
}
function Landing(props) {
    const [learnMore, setLearnMore] = React.useState(false);
    if (props.activeSession === null && !learnMore) {
        return NoActiveSessionJumbotron(setLearnMore);
    }
    return LearnMoreJumbotron(routes);
}

const mapActiveSessionStateToProps = (state) => ({
    sessions: sessionsSelector(state),
    activeSession: activeSessionSelector(state),
});

const mapSessionsDispatchToProps = { setActiveSession };
const ConnectedActiveSessionDisplay = connect(
    mapActiveSessionStateToProps,
    mapSessionsDispatchToProps
)(ActiveSessionDisplay);

const ConnectedLandingView = connect(mapActiveSessionStateToProps)(Landing);
export { ConnectedLandingView as Landing };
