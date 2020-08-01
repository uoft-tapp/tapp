import React from "react";
import PropTypes from "prop-types";
import { FilterableMenu } from "./filterable-menu";
import { Badge, Dropdown } from "react-bootstrap";
import { apiPropTypes } from "../api/defs/prop-types";

export function ActiveSessionDisplay(props) {
    const { sessions = [], activeSession, setActiveSession } = props;
    // keep track of the dropdown visibility so that the filter can be cleared
    // whenever the dropdown is invisible.
    const [dropdownVisible, setDropdownVisible] = React.useState(false);
    const activeSessionId = activeSession ? activeSession.id : null;

    let label = <span className="text-secondary mr-2">Select a Session</span>;
    if (activeSessionId != null) {
        label = <span className="text-primary mr-2">{activeSession.name}</span>;
    }

    return (
        <Badge>
            Selected session:
            <Dropdown
                onSelect={(i) => {
                    setActiveSession(sessions[i]);
                }}
                onToggle={(desiredVisibility) =>
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
        </Badge>
    );
}
ActiveSessionDisplay.propTypes = {
    setActiveSession: PropTypes.func.isRequired,
    sessions: PropTypes.arrayOf(apiPropTypes.session).isRequired,
    activeSession: apiPropTypes.session,
};
