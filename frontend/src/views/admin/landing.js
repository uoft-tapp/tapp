import React from "react";
import { connect } from "react-redux";
import { Jumbotron, Button } from "react-bootstrap";
import { activeSessionSelector } from "../../api/actions";

function NoActiveSessionJumbotron() {
    return (
        <Jumbotron>
            <h1>Welcome to TAPP!</h1>
            <p>
                There is <strong>no active session</strong> selected.
            </p>
            <p>Choose an active session from the selected session menu.</p>
            <p>
                <Button variant="primary">Learn more about TAPP</Button>
            </p>
        </Jumbotron>
    );
}
function Landing(props) {
    if (props.activeSession === null) {
        return NoActiveSessionJumbotron();
    }
    return <div>This is a landing page.</div>;
}

const mapActiveSessionStateToProps = (state) => ({
    activeSession: activeSessionSelector(state),
});

const ConnectedLandingView = connect(mapActiveSessionStateToProps)(Landing);
export { ConnectedLandingView as Landing };
