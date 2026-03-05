import {
    RNS_SHOW_NOTIFICATION,
    RNS_HIDE_NOTIFICATION,
    RNS_REMOVE_ALL_NOTIFICATIONS,
} from "./const";

export interface ActionObject {
    label: string;
    callback?: (() => void) | undefined;
}

export type CallBackFunction = (notification: Notification) => void;
export interface Notification {
    title?: string | React.JSX.Element | undefined;
    message?: string | React.JSX.Element | undefined;
    level?: "error" | "warning" | "info" | "success" | undefined;
    position?: "tr" | "tl" | "tc" | "br" | "bl" | "bc" | undefined;
    autoDismiss?: number | undefined;
    dismissible?:
        | "both"
        | "button"
        | "click"
        | "hide"
        | "none"
        | boolean
        | undefined;
    action?: ActionObject | undefined;
    children?: React.ReactNode | undefined;
    onAdd?: CallBackFunction | undefined;
    onRemove?: CallBackFunction | undefined;
    uid?: number | string | undefined;
}

//Example opts
// {
//   title: 'Hey, it\'s good to see you!',
//   message: 'Now you can see how easy it is to use notifications in React!',
//   position: 'tr',
//   autoDismiss: 0,
//   action: {
//     label: 'Awesome!',
//     callback: function() {
//       console.log('Clicked');
//     }
//   }
// }

export function show(opts: Notification = {}, level = "success") {
    return {
        type: RNS_SHOW_NOTIFICATION,
        ...opts,
        uid: opts.uid || Date.now(),
        level,
    };
}

export function success(opts: Notification) {
    return show(opts, "success");
}

export function error(opts: Notification) {
    return show(opts, "error");
}

export function warning(opts: Notification) {
    return show(opts, "warning");
}

export function info(opts: Notification) {
    return show(opts, "info");
}

export function hide(uid: number | string) {
    return {
        type: RNS_HIDE_NOTIFICATION,
        uid,
    };
}

export function removeAll() {
    return { type: RNS_REMOVE_ALL_NOTIFICATIONS };
}
