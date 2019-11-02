import React from "react";
import PropTypes from "prop-types";
import { Dropdown, Form, Col } from "react-bootstrap";
import { FilterableMenu } from "./filterable-menu";
import { docApiPropTypes } from "../api/defs/doc-generation";

/**
 * Displays and selects a session
 *
 * @export
 * @param {*} props
 * @returns
 */
export function SessionSelect(props) {
    const { sessions, activeSession, setActiveSession } = props;
    // keep track of the dropdown visibility so that the filter can be cleared
    // whenever the dropdown is invisible.
    const [dropdownVisible, setDropdownVisible] = React.useState(false);

    const activeSessionId = (activeSession || {}).id;
    const label = !activeSessionId ? (
        <span className="text-secondary mr-2">Select a Session</span>
    ) : (
        <span className="text-primary mr-2">{activeSession.name}</span>
    );
    return (
        <div>
            <h3>Select Session</h3>
            <Dropdown
                onSelect={i => {
                    setActiveSession(sessions[i]);
                }}
                onToggle={desiredVisibility =>
                    setDropdownVisible(desiredVisibility)
                }
                show={dropdownVisible}
            >
                <Dropdown.Toggle split variant="light">
                    {label}
                </Dropdown.Toggle>
                <FilterableMenu
                    items={sessions}
                    activeItemId={activeSessionId}
                    clearFilter={!dropdownVisible}
                />
            </Dropdown>
        </div>
    );
}
SessionSelect.propTypes = {
    setActiveSession: PropTypes.func.isRequired,
    sessions: PropTypes.array.isRequired,
    activeSession: PropTypes.object
};

/**
 * Edit a session
 *
 * @export
 * @param {{session: object, setSession: function}} props
 * @returns
 */
export function SessionEditor(props) {
    const { session, setSession } = props;

    /**
     * Create a callback function which updates the specified attribute
     * of a position.
     *
     * @param {string} attr
     * @returns
     */
    function setAttrFactory(attr) {
        return e => {
            const newVal = e.target.value || "";
            const newPosition = { ...session, [attr]: newVal };
            setSession(newPosition);
        };
    }

    /**
     * Create a bootstrap form component that updates the specified attr
     * of `position`
     *
     * @param {string} title - Label text of the form control
     * @param {string} attr - attribute of `position` to be updated when this form control changes
     * @returns {node}
     */
    function createFieldEditor(title, attr, additionalAttr = { type: "text" }) {
        return (
            <React.Fragment>
                <Form.Label>{title}</Form.Label>
                <Form.Control
                    {...additionalAttr}
                    value={session[attr] || ""}
                    onChange={setAttrFactory(attr)}
                />
            </React.Fragment>
        );
    }

    return (
        <Form>
            <Form.Row>
                <Form.Group as={Col}>
                    {createFieldEditor("Session Name (e.g. 2019 Fall)", "name")}
                </Form.Group>
            </Form.Row>
            <Form.Row>
                <Form.Group as={Col}>
                    {createFieldEditor("Start Date", "start_date", {
                        type: "date"
                    })}
                </Form.Group>
                <Form.Group as={Col}>
                    {createFieldEditor("End Date", "end_date", {
                        type: "date"
                    })}
                </Form.Group>
            </Form.Row>
            <Form.Row>
                <Form.Group as={Col}>
                    {createFieldEditor("Rate 1 (pre-January rate)", "rate1", {
                        type: "number",
                        step: "0.01",
                        min: 0
                    })}
                </Form.Group>
                <Form.Group as={Col}>
                    {createFieldEditor("Rate 2 (post-January rate)", "rate2", {
                        type: "number",
                        step: "0.01",
                        min: 0
                    })}
                </Form.Group>
            </Form.Row>
        </Form>
    );
}
SessionEditor.propTypes = {
    session: docApiPropTypes.session.isRequired,
    setSession: PropTypes.func.isRequired
};
