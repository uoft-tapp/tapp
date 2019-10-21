import {
    getUnusedId,
    find,
    getAttributesCheckMessage,
    deleteInArray
} from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";

export const sessionsRoutes = {
    get: {
        "/sessions": documentCallback({
            func: data => [...data.sessions],
            summary: "Get all available sessions",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.session)
        })
    },
    post: {
        "/sessions": (data, params, body) => {
            // body should be a session object. If it contains an id,
            // update an existing session. Otherwise, create a new one.
            const matchingSession = find(body, data.sessions);
            if (matchingSession) {
                return Object.assign(matchingSession, body);
            }
            // if we're here, we need to create a new session
            // but check if the session name is empty or duplicate
            const message = getAttributesCheckMessage(body, data.sessions, {
                name: { required: true, unique: true }
            });
            if (message) {
                throw new Error(message);
            }
            // create new session
            const newId = getUnusedId(data.sessions);
            const newSession = { ...body, id: newId };
            data.sessions.push(newSession);
            return newSession;
        },
        "/sessions/delete": (data, params, body) => {
            const matchingSession = find(body, data.sessions);
            if (!matchingSession) {
                throw new Error(
                    `Could not find session with id=${body.id} to delete`
                );
            }
            deleteInArray(matchingSession, data.sessions);
            // if we found the session with matching id, delete it.
            return {};
        }
    }
};
