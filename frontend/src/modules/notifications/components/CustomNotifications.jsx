import React from "react";
import { connect } from "react-redux";
import Notifications from "react-notification-system-redux";
import { style } from "../constants";

export default connect(({ notifications }) => ({ notifications }))(
    ({ notifications }) => (
        <Notifications style={style} notifications={notifications} />
    )
);
