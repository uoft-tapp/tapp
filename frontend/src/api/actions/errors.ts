import { error } from "../../components/react-notification-system-redux/actions";

// these properties are for `react-notification-system-redux`
const defaultNotifProps = {
    position: "tr",
    autoDismiss: 10,
    title: "Error",
} as const;

export const fetchError = (payload: string) =>
    error({
        ...defaultNotifProps,
        title: "Error fetching data",
        message: payload,
    });

export const upsertError = (payload: string) =>
    error({
        ...defaultNotifProps,
        title: "Error updating/inserting data",
        message: payload,
    });

export const deleteError = (payload: string) =>
    error({
        ...defaultNotifProps,
        title: "Error deleting data",
        message: payload,
    });

// General error for when a more specific error
// type is not known
export const apiError = (payload: string) =>
    error({
        ...defaultNotifProps,
        title: "API Error",
        message: payload,
    });
