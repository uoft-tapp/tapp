import { useSelector } from "react-redux";
import Notifications from "react-notification-system-redux";
import { RootState } from "../../../rootReducer";

/**
 * Notifications popup whenever they show up in state.ui.notifications
 */
export function ConnectedNotifications() {
    const notifications = useSelector(
        (state: RootState) => state.ui.notifications
    );
    return <Notifications notifications={notifications} />;
}
