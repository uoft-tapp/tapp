import React from "react";
import PropTypes from "prop-types";
import { Badge } from "react-bootstrap";
import { apiPropTypes } from "../api/defs/prop-types";

export function ActiveUserDisplay(props) {
    const { user = { utorid: "<noid>", roles: [] }, role: _role } = props;
    const role = _role || (user.roles || [])[0];

    return (
        <Badge>
            Login: {user.utorid}{" "}
            {(user.roles || []).length <= 1 ? null : <span>as {role}</span>}
        </Badge>
    );
}
ActiveUserDisplay.propTypes = {
    user: apiPropTypes.user,
    role: PropTypes.string
};
