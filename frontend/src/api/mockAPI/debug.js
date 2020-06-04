import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes,
} from "../defs/doc-generation";
import { User } from "./active_user";

// persistent storage for the Debug class
const storage = {};

export class Debug {
    constructor(data) {
        this.data = data;
    }
    getAllData() {
        return this.data;
    }
    makeSnapshot(name = "snapshot") {
        storage[name] = JSON.stringify(this.getAllData());
        return this.getAllData();
    }
    clearData() {
        this.makeSnapshot("beforeclear");
        Object.keys(this.data).forEach(
            (key) => (this.data[key] = createBlankCopy(this.data[key]))
        );
        return this.getAllData();
    }
    restoreSnapshot(name = "snapshot") {
        const snapshot = JSON.parse(storage[name] || "{}");
        this.clearData();
        Object.assign(this.data, snapshot);
        return this.getAllData();
    }
}

export const debugRoutes = {
    get: {
        "/debug/active_user": documentCallback({
            func: (data) => new User(data).getActiveUser(),
            summary:
                "Gets the active user; in debug mode this is specified by posting to `active_user`.",
            returns: docApiPropTypes.user,
        }),
        "/debug/users": documentCallback({
            func: (data) => new User(data).findAll(),
            summary: "Get a list of all users",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.user),
        }),
    },
    post: {
        "/debug/active_user": documentCallback({
            func: (data, params, body) => {
                const user = new User(data);
                const found_user = user.find(body);
                if (!found_user) {
                    throw new Error(
                        `Could not find user matching ${JSON.stringify(body)}`
                    );
                }
                user.setActiveUser(found_user);
                return user.getActiveUser();
            },
            summary:
                "Sets the active user; this will override whatever credentials are passed to the server.",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.user),
            posts: docApiPropTypes.user,
        }),
        "/debug/users": documentCallback({
            func: (data, params, body) => new User(data).upsert(body),
            summary:
                "Adds a user; this is done without any permission checks, so it can be used to bootstrap permissions during debug.",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.user),
            posts: docApiPropTypes.user,
        }),
        "/debug/clear_data": documentCallback({
            func: (data) => {
                return new Debug(data).clearData();
            },
            summary: "Deletes all data in the database",
        }),
        "/debug/snapshot": documentCallback({
            func: (data) => {
                return new Debug(data).makeSnapshot();
            },
            summary: "Makes a snapshot of the current state of the database",
        }),
        "/debug/restore_snapshot": documentCallback({
            func: (data) => {
                return new Debug(data).restoreSnapshot();
            },
            summary: "Restores the last snapshot of the database",
        }),
    },
};

/**
 * Returns the blank value of the same type
 * as the passed-in data
 *
 * @param {*} data
 * @returns
 */
function createBlankCopy(data) {
    if (typeof data === "object") {
        if (data instanceof Array) {
            return [];
        } else {
            return {};
        }
    } else if (typeof data === "string") {
        return "";
    } else {
        // If `data` is not of type string, array or object
        // use the constructor, which will return blank value
        // of that particular type.
        return data.constructor();
    }
}
