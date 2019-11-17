import { MockAPIController, find } from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";

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
        Object.keys(this.data).forEach(key => delete this.data[key]);
        return this.getAllData();
    }
    restoreSnapshot(name = "snapshot") {
        const snapshot = JSON.parse(storage[name] || "{}");
        this.clearData();
        Object.assign(this.data, snapshot);
        return this.getAllData();
    }
}

export class User extends MockAPIController {
    constructor(data) {
        super(data, data.users);
    }
    rawFind(query) {
        if (query == null) {
            return null;
        }
        if (query.utorid != null) {
            return find(query, this.ownData, "utorid");
        }
        return find({ utorid: query }, this.ownData, "utorid");
    }
    setActiveUser(user) {
        const matchingUser = this.find(user);
        if (!matchingUser) {
            throw new Error(
                `Cannot find user ${JSON.stringify(user)} to set as active`
            );
        }
        this.data.active_user = matchingUser.utorid;
    }
    getActiveUser() {
        return this.find(this.data.active_user);
    }
}

export const debugRoutes = {
    get: {
        "/debug/users": documentCallback({
            func: data => new User(data).findAll(),
            summary:
                "Get all available contract templates (these are literal files on the server).",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.user)
        }),
        "/debug/active_user": documentCallback({
            func: data => new User(data).getActiveUser(),
            summary: "Gets the currently active user.",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.user)
        })
    },
    post: {
        "/debug/users": documentCallback({
            func: (data, params, body) => new User(data).upsert(body),
            summary: "Upserts user info",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.user),
            posts: docApiPropTypes.user
        }),
        "/debug/active_user": documentCallback({
            func: (data, params, body) => new User(data).upsert(body),
            summary:
                "Sets the active user; this will override whatever credentials are passed to the server.",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.user),
            posts: docApiPropTypes.user
        }),
        "/debug/clear_data": documentCallback({
            func: data => {
                return new Debug(data).clearData();
            },
            summary: "Deletes all data in the database"
        }),
        "/debug/snapshot": documentCallback({
            func: data => {
                return new Debug(data).makeSnapshot();
            },
            summary: "Makes a snapshot of the current state of the database"
        }),
        "/debug/restore_snapshot": documentCallback({
            func: data => {
                return new Debug(data).restoreSnapshot();
            },
            summary: "Restores the last snapshot of the database"
        })
    }
};
