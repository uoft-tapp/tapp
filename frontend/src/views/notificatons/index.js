/**
 * Notifications popup whenever they show up in state.ui.notifications
 */
import { connect } from "react-redux";
import Notifications from "react-notification-system-redux";

export const ConnectedNotifications = connect(state => ({
    notifications: state.ui.notifications
}))(Notifications);
