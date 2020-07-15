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
import { Session as SessionType } from "../defs/types";

interface RouteParams {
    role: "admin" | "instructor" | "ta";
    [key: string]: string;
}

export class Session extends MockAPIController {
    constructor(data: any) {
        super(data, data.sessions);
    }
    create(session: Partial<SessionType>): SessionType {
        const newSession = super.create(session) as SessionType;
        // If we insert a new session, we need to make sure we create
        // a corresponding assignments_by_session array
        this.data.assignments_by_session[newSession.id] = [];
        return newSession;
    }
    findAll(...args: any[]): SessionType[] {
        return super.findAll(...args) as SessionType[];
    }
    validateNew(session: Partial<SessionType>) {
        // if we're here, we need to create a new session
        // but check if the session name is empty or duplicate
        const message = getAttributesCheckMessage(session, this.ownData, {
            name: { required: true, unique: true },
        } as any);
        if (message) {
            throw new Error(message);
        }
    }
    validateProp(prop: keyof SessionType, value: any, id: number) {
        if (prop === "name") {
            // check if `name` is empty
            if (value === undefined || value.length === 0) {
                throw new Error(
                    `Property ${prop} cannot be empty or undefined.`
                );
            }
            // if `name` is not empty, make sure it is unique after the update
            // by filtering out the request session
            const filteredData = this.findAll().filter(
                (item) => item.id !== id
            );
            // and make sure `name` is unique to the rest
            const message = getAttributesCheckMessage(
                { name: value },
                filteredData,
                {
                    name: { unique: true },
                } as any
            );
            if (message) {
                throw new Error(message);
            }
        }

        return true;
    }
}

export const sessionsRoutes = {
    get: {
        "/sessions": documentCallback({
            func: (data: any) => new Session(data).findAll(),
            summary: "Get all available sessions",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.session),
        }),
    },
    post: {
        "/sessions": documentCallback({
            func: (
                data: any,
                params: RouteParams,
                body: Partial<SessionType>
            ) => {
                errorUnlessRole(params, "admin");
                // body should be a session object. If it contains an id,
                // update an existing session. Otherwise, create a new one.
                return new Session(data).upsert(body);
            },
            summary: "Upsert a session",
            returns: docApiPropTypes.session,
            posts: docApiPropTypes.session,
        }),
        "/sessions/delete": documentCallback({
            func: (
                data: any,
                params: RouteParams,
                body: Partial<SessionType>
            ) => {
                errorUnlessRole(params, "admin");
                return new Session(data).delete(body as any);
            },
            summary: "Delete a session",
            posts: docApiPropTypes.idOnly,
            returns: docApiPropTypes.session,
        }),
    },
};
