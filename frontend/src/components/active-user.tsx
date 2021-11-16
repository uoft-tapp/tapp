import React from "react";
import { Badge, Dropdown } from "react-bootstrap";
import { User, UserRole } from "../api/defs/types";

const DEFAULT_USER: Omit<User, "id"> = { utorid: "<noid>", roles: [] };

export function ActiveUserDisplay(props: {
    activeUser?: User;
    activeRole?: UserRole | null;
    setActiveUserRole: (role: UserRole) => any;
}) {
    const [dropdownVisible, setDropdownVisible] = React.useState(false);
    const { activeUser = DEFAULT_USER, activeRole, setActiveUserRole } = props;

    const roles = activeUser.roles;
    const label = !activeRole ? (
        <span className="text-secondary mr-2">Select a role</span>
    ) : (
        <span className="text-primary mr-2">{activeRole}</span>
    );

    const isActiveRole = (role: UserRole) => {
        return activeRole === role;
    };
    return (
        <Badge>
            Login: {activeUser.utorid}
            {" as"}
            <Dropdown
                onSelect={(i) => {
                    if (i == null) {
                        return;
                    }
                    setActiveUserRole(roles[+i]);
                }}
                onToggle={(desiredVisibility) =>
                    setDropdownVisible(desiredVisibility)
                }
                show={dropdownVisible}
                alignRight
            >
                <Dropdown.Toggle split variant="light">
                    {label}
                </Dropdown.Toggle>
                <Dropdown.Menu flip={true}>
                    {(roles || []).map((role, index) => (
                        <Dropdown.Item
                            key={index}
                            eventKey={"" + index}
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
