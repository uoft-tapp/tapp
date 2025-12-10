import React from "react";
import { Dropdown } from "react-bootstrap";

const ident = () => {};

/**
 * A toggle switch for turning on and off the Mock API. An instance
 * of the Mock API is included in this component, and this component
 * takes no arguments.
 *
 * This component only renders when `import.meta.env.VITE_DEV_FEATURES` is truthy.
 *
 * @export
 * @returns {React.ElementType}
 */
function ActiveUserButton({
    users = [],
    activeUser = {},
    setActiveUser = ident,
    fetchUsers = ident,
}) {
    const [dropdownVisible, setDropdownVisible] = React.useState(false);

    React.useEffect(() => {
        // Whenever the dropdown is open, fetch a list of all available users.
        // This would normally not be a good idea, but since this button is only
        // used in debug mode, it's okay.
        if (dropdownVisible) {
            fetchUsers();
        }
    }, [dropdownVisible, fetchUsers]);

    return (
        <span
            title={
                "Set which user you are currently logged in as. This is only available when the server is running in debug mode."
            }
            className="logged-in-as-container"
        >
            <label>Logged in as</label>
            <Dropdown
                onSelect={(i) => {
                    setActiveUser(users[i]);
                }}
                onToggle={(desiredVisibility) =>
                    setDropdownVisible(desiredVisibility)
                }
                show={dropdownVisible}
                align="end"
            >
                <Dropdown.Toggle split variant="dark">
                    {activeUser.utorid}{" "}
                </Dropdown.Toggle>
                <Dropdown.Menu flip={true}>
                    {(users || []).map((user, i) => (
                        <Dropdown.Item
                            key={i}
                            eventKey={"" + i}
                            active={activeUser.utorid === user.utorid}
                        >
                            {user.utorid} ({(user.roles || []).join(", ")})
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>
        </span>
    );
}

export { ActiveUserButton };
