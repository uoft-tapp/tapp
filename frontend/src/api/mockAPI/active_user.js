import { MockAPIController, find, getAttributesCheckMessage } from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";

export class User extends MockAPIController {
    constructor(data) {
        super(data, data.users);
    }
    validateNew(user) {
        const message = getAttributesCheckMessage(user, this.ownData, {
            utorid: { required: true, unique: true }
        });
        if (message) {
            throw new Error(message);
        }
    }
    rawFind(query) {
        if (query == null) {
            return null;
        }
        // If we pass an `id`, rely on that, otherwise,
        // use the `utorid`.
        if (query.id != null) {
            return find(query, this.ownData);
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

export const activeUserRoutes = {
    get: {
        "/users": documentCallback({
            func: data => new User(data).findAll(),
            summary: "Get all available users.",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.user)
        }),
        "/active_user": documentCallback({
            func: data => new User(data).getActiveUser(),
            summary: "Gets the currently active user.",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.user),
            roles: ["instructor", "ta"]
        })
    },
    post: {
        "/users": documentCallback({
            func: (data, params, body) => new User(data).upsert(body),
            summary: "Upserts user info",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.user),
            posts: docApiPropTypes.user
        })
    }
};
