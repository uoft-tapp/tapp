import { getAttributesCheckMessage, MockAPIController } from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";

export class Session extends MockAPIController {
    constructor(data) {
        super(data, data.sessions);
    }
    create(session) {
        const newSession = super.create(session);
        // If we insert a new session, we need to make sure we create
        // a corresponding assignments_by_session array
        this.data.assignments_by_session[newSession.id] = [];
        return newSession;
    }
    validateNew(session) {
        // if we're here, we need to create a new session
        // but check if the session name is empty or duplicate
        const message = getAttributesCheckMessage(session, this.ownData, {
            name: { required: true, unique: true }
        });
        if (message) {
            throw new Error(message);
        }
    }
}

export const sessionsRoutes = {
    get: {
        "/sessions": documentCallback({
            func: data => new Session(data).findAll(),
            summary: "Get all available sessions",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.session)
        })
    },
    post: {
        "/sessions": documentCallback({
            func: (data, params, body) => {
                // body should be a session object. If it contains an id,
                // update an existing session. Otherwise, create a new one.
                return new Session(data).upsert(body);
            },
            summary: "Upsert a session",
            returns: docApiPropTypes.session,
            posts: docApiPropTypes.session
        }),
        "/sessions/delete": documentCallback({
            func: (data, params, body) => {
                return new Session(data).delete(body);
            },
            summary: "Delete a session",
            posts: docApiPropTypes.idOnly,
            returns: docApiPropTypes.session
        })
    }
};
