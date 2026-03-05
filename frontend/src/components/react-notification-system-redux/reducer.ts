import { Action } from "redux";
import {
    RNS_SHOW_NOTIFICATION,
    RNS_HIDE_NOTIFICATION,
    RNS_REMOVE_ALL_NOTIFICATIONS,
} from "./const";

type NotificationsState = Notification[];
type NotificationsReducer<A extends Action> = (
    state: NotificationsState,
    action: A
) => NotificationsState;

export const Notifications: NotificationsReducer<any> = function Notifications(
    state = [],
    action = {}
) {
    switch (action.type) {
        case RNS_SHOW_NOTIFICATION:
            const { type, ...rest } = action;
            return [...state, { ...rest, uid: action.uid }];
        case RNS_HIDE_NOTIFICATION:
            return state.filter((notification) => {
                return (notification as any)?.uid !== action.uid;
            });
        case RNS_REMOVE_ALL_NOTIFICATIONS:
            return [];
    }
    return state;
};
export default Notifications;
