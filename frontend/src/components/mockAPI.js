import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";

let mockAPI = { replaceGlobalFetch: () => {}, restoreGlobalFetch: () => {} };
//import { mockAPI } from "../api/mockAPI";

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
    const { fetchSessions = () => {} } = props;
    const [active, _setActive] = React.useState(mockAPI.active);
    function setActive(state) {
        if (state === active) {
            // avoid getting into an update loop
            return;
        }
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
                    onClick={() => setActive(true)}
                >
                    On
                </Button>
                <Button
                    variant={active ? "secondary" : "primary"}
                    onClick={() => setActive(false)}
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

export { ToggleMockApi };
