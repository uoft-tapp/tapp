import { error } from "react-notification-system-redux";

// these properties are for `react-notification-system-redux`
const defaultNotifProps = {
    position: "tr",
    autoDismiss: 10,
    title: "Error",
};

export const fetchError = (payload) =>
    error({
        ...defaultNotifProps,
        title: "Error fetching data",
        message: payload,
    });

export const upsertError = (payload) =>
    error({
        ...defaultNotifProps,
        title: "Error updating/inserting data",
        message: payload,
    });

export const deleteError = (payload) =>
    error({
        ...defaultNotifProps,
        title: "Error deleting data",
        message: payload,
    });

// General error for when a more specific error
// type is not known
export const apiError = (payload) =>
    error({
        ...defaultNotifProps,
        title: "API Error",
        message: payload,
    });
