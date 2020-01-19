import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
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

export const debugRoutes = {
    get: {},
    post: {
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
