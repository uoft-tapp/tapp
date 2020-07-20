import {
    getAttributesCheckMessage,
    MockAPIController,
    errorUnlessRole,
} from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes,
} from "../defs/doc-generation";
import { Session } from "./sessions";
import { Assignment } from "./assignments";
import { stringToNativeType } from "../../libs/urlUtils";

export class Ddah extends MockAPIController {
    constructor(data) {
        super(data, data.ddahs);
    }
    validateNew(ddah) {
        const message = getAttributesCheckMessage(ddah, this.ownData, {
            assignment_id: { required: true, unique: true },
        });
        if (message) {
            throw new Error(message);
        }
    }
    findAllBySession(session) {
        const matchingSession = new Session(this.data).find(session);
        if (!matchingSession) {
            throw new Error(
                `Cannot find DDAHs by session because session ${JSON.stringify(
                    session
                )} cannot be found`
            );
        }
        const assignments = new Assignment(this.data).findAllBySession(
            matchingSession
        );
        const assignmentIds = assignments.map((assignment) => assignment.id);
        return this.ownData.filter((ddah) =>
            assignmentIds.includes(ddah.assignment_id)
        );
    }
}

export const ddahsRoutes = {
    get: {
        "/sessions/:session_id/ddahs": documentCallback({
            func: (data, params) => {
                if (params.role === "admin") {
                    return new Ddah(data).findAllBySession(params.session_id);
                }
                errorUnlessRole(params, "");
            },
            summary:
                "Get all ddah forms associated with assignments for the given session",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.ddah),
        }),
        "/ddahs/:ddah_id": documentCallback({
            func: (data, params) => new Ddah(data).find(params.ddah_id),
            summary: "Get a ddah",
            returns: docApiPropTypes.ddah,
        }),
        "/assignments/:assignment_id/ddah": documentCallback({
            func: (data, params) => {
                if (params.role === "admin" || params.role === "instructor") {
                    const assignment = new Assignment(data).find(
                        params.assignment_id
                    );
                    if (!assignment) {
                        throw new Error(
                            `Cannot create a DDAH because an assignment with id '${params.assignment_id}' cannot be found.`
                        );
                    }
                    return new Ddah(data)
                        .findAll()
                        .find((ddah) => ddah.assignment_id === assignment.id);
                }
                // If we make it here, we should error because of invalid permissions
                errorUnlessRole(params, "");
            },
            summary: "Find a DDAH associated with a specific assignment.",
            returns: docApiPropTypes.ddah,
        }),
    },
    post: {
        "/ddahs": documentCallback({
            func: (data, params, body) => {
                errorUnlessRole(params, "admin");
                return new Ddah(data).upsert(body);
            },
            summary: "Upsert a ddah",
            posts: docApiPropTypes.ddah,
            returns: docApiPropTypes.ddah,
        }),
        "/ddahs/:ddah_id/approve": documentCallback({
            func: (data, params) => {
                errorUnlessRole(params, "admin");
                const ddah = new Ddah(data).find({ id: params.ddah_id });
                if (!ddah) {
                    throw new Error(
                        `Could not find DDAH with id '${params.ddah_id}'`
                    );
                }
                return new Ddah(data).upsert({
                    ...ddah,
                    approved_date: new Date().toISOString(),
                });
            },
            summary: "Approve a DDAH",
            returns: docApiPropTypes.ddah,
        }),
        "/ddahs/:ddah_id/email": documentCallback({
            func: (data, params) => {
                if (params.role === "admin" || params.role === "instructor") {
                    const ddah = new Ddah(data).find({ id: params.ddah_id });
                    if (!ddah) {
                        throw new Error(
                            `Could not find DDAH with id '${params.ddah_id}'`
                        );
                    }
                    return new Ddah(data).upsert({
                        ...ddah,
                        emailed_date: new Date().toISOString(),
                    });
                }
                // If we make it here, we should error because of invalid permissions
                errorUnlessRole(params, "");
            },
            summary: "Email a DDAH",
            returns: docApiPropTypes.ddah,
        }),
        "/assignments/:assignment_id/ddah/create": documentCallback({
            func: (data, params, body) => {
                if (params.role === "admin" || params.role === "instructor") {
                    const assignment = new Assignment(data).find(
                        params.assignment_id
                    );
                    if (!assignment) {
                        throw new Error(
                            `Cannot create a DDAH because an assignment with id '${params.assignment_id}' cannot be found.`
                        );
                    }
                    return new Ddah(data).upsert({
                        ...body,
                        assignment_id: stringToNativeType(params.assignment_id),
                    });
                }
                // If we make it here, we should error because of invalid permissions
                errorUnlessRole(params, "");
            },
            summary:
                "Create a DDAH associated with a specific assignment. You may specify the details of the DDAH in th body of this request.",
            posts: docApiPropTypes.ddah,
            returns: docApiPropTypes.ddah,
        }),
    },
};
