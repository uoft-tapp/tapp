import React from "react";
import PropTypes from "prop-types";
import { Badge, Dropdown } from "react-bootstrap";
import { apiPropTypes } from "../api/defs/prop-types";

export function ActiveUserDisplay(props) {
    const [dropdownVisible, setDropdownVisible] = React.useState(false);
    const {
        activeUser = { utorid: "<noid>", roles: [] },
        activeRole,
        initFromStage
    } = props;

    const roles = activeUser.roles;
    const label = !activeRole ? (
        <span className="text-secondary mr-2">Select a role</span>
    ) : (
        <span className="text-primary mr-2">{activeRole}</span>
    );

    const isActiveRole = role => {
        return activeRole === role;
    };
    return (
        <Badge>
            Login: {activeUser.utorid}
            {" as"}
            <Dropdown
                onSelect={i => {
                    initFromStage("setActiveUserRole", {
                        activeUserRole: roles[i]
                    });
                }}
                onToggle={desiredVisibility =>
                    setDropdownVisible(desiredVisibility)
                }
                show={dropdownVisible}
            >
                <Dropdown.Toggle split variant="light">
                    {label}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {(roles || []).map((role, index) => (
                        <Dropdown.Item
                            key={index}
                            eventKey={index}
                            active={isActiveRole(role)}
                        >
                            {role}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>
        </Badge>
    );
}
ActiveUserDisplay.propTypes = {
    activeUser: apiPropTypes.user,
    activeRole: PropTypes.string,
    initFromStage: PropTypes.func.isRequired
};
