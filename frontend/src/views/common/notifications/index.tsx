import { useSelector } from "react-redux";
import { RootState } from "../../../rootReducer";
import {} from "../../../components/react-notification-system-redux";
import { Toast, ToastContainer } from "react-bootstrap";
import {
    Notification,
    hide,
} from "../../../components/react-notification-system-redux/actions";
import { useThunkDispatch } from "../../../libs/thunk-dispatch";
import React from "react";

import "./index.css";
import classNames from "classnames";

/**
 * Notifications popup whenever they show up in state.ui.notifications
 */
export function ConnectedNotifications() {
    const notifications = useSelector(
        (state: RootState) => state.ui.notifications
    ) as Notification[];
    return (
        <ToastContainer position="top-end" className="p-3">
            {notifications.map((notification) => (
                <NotificationDisplay
                    key={notification.uid}
                    notification={notification}
                />
            ))}
        </ToastContainer>
    );
    // return <Notifications notifications={notifications} />;
}

/**
 * Show a dismissible notification popup. Auto dismisses after the timeout. Timeout pauses when mouse enters the notification.
 */
function NotificationDisplay({ notification }: { notification: Notification }) {
    const dispatch = useThunkDispatch();
    const [show, setShow] = React.useState(false);
    const [active, setActive] = React.useState(false);
    const [hasInit, setHasInit] = React.useState(false);
    const hideNotification = React.useCallback(() => {
        setShow(false);
        // Wait for the animation to finish and then remove the notification.
        setTimeout(() => {
            dispatch(hide(notification.uid!));
        }, 1000);
    }, [dispatch, notification.uid]);

    const background = notification.level === "error" ? "danger" : "warning";
    const timerRef = React.useRef<Timer | null>(null);

    React.useEffect(() => {
        if (notification.autoDismiss && notification.autoDismiss > 0) {
            timerRef.current = new Timer(() => {
                if (!active) {
                    hideNotification();
                }
            }, notification.autoDismiss * 1000);
            return () => timerRef.current?.clear();
        }
    }, [notification, hideNotification, active]);

    React.useEffect(() => {
        // Slight delay in showing to allow for animation
        if (!hasInit && !show) {
            window.setTimeout(() => {
                setHasInit(true);
                setShow(true);
            }, 100);
        }
    }, [hasInit, show]);

    return (
        <Toast
            bg={background}
            className={classNames("my-1 warning-toast", { active })}
            onClose={(e) => {
                e?.preventDefault();
                hideNotification();
            }}
            onMouseEnter={() => timerRef.current?.pause()}
            onMouseLeave={() => timerRef.current?.resume()}
            onClick={() => {
                // If we click the notification, it will never hide
                timerRef.current?.clear();
                setActive(true);
            }}
            animation={true}
            show={show}
        >
            <Toast.Header>
                <strong className="me-auto">
                    {notification.title || "Notification"}
                </strong>
            </Toast.Header>
            <Toast.Body className="text-light">
                {notification.message}
            </Toast.Body>
        </Toast>
    );
}

/**
 * Pausable timer class
 */
class Timer {
    private timerId: ReturnType<typeof setTimeout> | null = null;
    private start = 0;
    private remaining: number;

    constructor(private callback: () => void, delay: number) {
        this.remaining = delay;
        this.resume();
    }

    pause(): void {
        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        this.remaining -= Date.now() - this.start;
    }

    resume(): void {
        this.start = Date.now();
        if (this.timerId !== null) {
            clearTimeout(this.timerId);
        }
        this.timerId = setTimeout(this.callback, Math.max(0, this.remaining));
    }

    clear(): void {
        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }
}
