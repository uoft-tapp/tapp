import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { connect } from "react-redux";
import { setGlobals } from "../views/globals/actions";

let mockAPI = { replaceGlobalFetch: () => {}, restoreGlobalFetch: () => {} };
//import { mockAPI } from "../api/mockAPI";

function setActive(state, props = {}) {
    const { fetchSessions = () => {}, active, _setActive = () => {} } = props;
    if (state === active) {
        // avoid getting into an update loop
        return;
    }

    // store the current activation state in a global (url-persistent) variable
    props.setGlobals({ ...props.globals, mockAPI: state });
    if (state === true) {
        mockAPI.replaceGlobalFetch();
    } else {
        mockAPI.restoreGlobalFetch();
    }
    _setActive(mockAPI.active);
    // after the mock API has been set, refetch the sessions,
    // which will trigger a refetch of all the other data.
    fetchSessions();
}

/**
 * A toggle switch for turning on and off the Mock API. An instance
 * of the Mock API is included in this component, and this component
 * takes no arguments.
 *
 * This component only renders when `process.env.NODE_ENV === "development"`.
 *
 * @export
 * @returns {React.ElementType}
 */
let ToggleMockApi = function ToggleMockApi(props) {
    const [active, _setActive] = React.useState(mockAPI.active);
    const fullProps = { ...props, active, _setActive };
    // Check the global state to see if we should activate right away
    React.useEffect(() => {
        if (props.globals.mockAPI === true) {
            setActive(true, fullProps);
        }
        // eslint-disable-next-line
    }, [props.globals]);

    return (
        <span
            title={
                "The Mock API simulates the TAPP API but uses browser-based storage. This allows you to test TAPP functionality without a working server."
            }
        >
            Mock API{" "}
            <ButtonGroup>
                <Button
                    variant={active ? "primary" : "secondary"}
                    onClick={() => setActive(true, fullProps)}
                >
                    On
                </Button>
                <Button
                    variant={active ? "secondary" : "primary"}
                    onClick={() => setActive(false, fullProps)}
                >
                    Off
                </Button>
            </ButtonGroup>
        </span>
    );
};

// in production, ToggleMockApi is a no-op. In development, it actually
// does something.
/* eslint-disable */
if (process.env.NODE_ENV === "development") {
    const mock = require("../api/mockAPI");
    mockAPI = mock.mockAPI;
} else {
    ToggleMockApi = function ToggleMockApi() {
        return null;
    };
}
/* eslint-enable */

ToggleMockApi = connect(
    state => ({ globals: state.ui.globals }),
    { setGlobals }
)(ToggleMockApi);

export { ToggleMockApi };
