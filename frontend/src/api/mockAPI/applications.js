import {
    getAttributesCheckMessage,
    MockAPIController,
    findAllById,
} from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes,
} from "../defs/doc-generation";
import { Session } from "./sessions";

export class Application extends MockAPIController {
    constructor(data) {
        super(data, data.applications);
    }
    validateNew(applicant) {
        const message = getAttributesCheckMessage(applicant, this.ownData, {
            session_id: { required: true },
            applicant_id: { required: true },
        });
        if (message) {
            throw new Error(message);
        }
    }
    findAllBySession(session) {
        const matchingSession = new Session(this.data).find(session);
        if (!matchingSession) {
            throw new Error(
                `Cannot find applicant by session because session ${JSON.stringify(
                    session
                )} cannot be found`
            );
        }
        // The applicants for this session are those who have submitted an application for this session
        return findAllById([matchingSession.id], this.ownData, "session_id");
    }
}

export const applicationsRoutes = {
    get: {
        "/sessions/:session_id/applications": documentCallback({
            func: (data, params) =>
                new Application(data).findAllBySession(params.session_id),
            summary: "Get all applications associated with the given session",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.application),
        }),
    },
    post: {
        "/applications": documentCallback({
            func: (data, params, body) => new Application(data).upsert(body),
            summary: "Upsert an application",
            posts: docApiPropTypes.application,
            returns: docApiPropTypes.application,
        }),
        "/sessions/:session_id/applications": documentCallback({
            func: (data, params, body) => new Application(data).upsert(body),
            summary: "Upsert an application",
            posts: docApiPropTypes.application,
            returns: docApiPropTypes.application,
        }),
    },
};
