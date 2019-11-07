import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "react-bootstrap";
import { FilterableMenu } from "./filterable-menu";

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
