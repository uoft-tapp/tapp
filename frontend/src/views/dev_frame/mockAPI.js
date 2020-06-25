import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { connect } from "react-redux";
import { setGlobals, globalsSelector } from "../../api/actions";

/**
 * A toggle switch for turning on and off the Mock API. An instance
 * of the Mock API is included in this component, and this component
 * takes no arguments.
 *
 * This component only renders when `process.env.REACT_APP_DEV_FEATURES` is truthy.
 *
 * @export
 * @returns {React.ElementType}
 */
let ToggleMockApi = function ToggleMockApi(props) {
    const { globals, setMockAPIState } = props;
    const active = globals.mockAPI;

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
                    onClick={() => setMockAPIState(true)}
                >
                    On
                </Button>
                <Button
                    variant={active ? "secondary" : "primary"}
                    onClick={() => setMockAPIState(false)}
                >
                    Off
                </Button>
            </ButtonGroup>
        </span>
    );
};

ToggleMockApi = connect((state) => ({ globals: globalsSelector(state) }), {
    setGlobals,
})(ToggleMockApi);

export { ToggleMockApi };
