import {
    getAttributesCheckMessage,
    findAllById,
    MockAPIController,
} from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes,
} from "../defs/doc-generation";
import { Session } from "./sessions";
import { Application } from "./applications";
import { Assignment } from "./assignments";

export class Applicant extends MockAPIController {
    constructor(data) {
        super(data, data.applicants);
    }
    validateNew(applicant) {
        const message = getAttributesCheckMessage(applicant, this.ownData, {
            utorid: { required: true, unique: true },
            first_name: { required: true },
            last_name: { required: true },
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
        // The applicants for this session are those who have submitted an
        // application for this session or those who have an assignment in this
        // session.
        const applications = new Application(this.data).findAllBySession(
            matchingSession
        );
        const assignments = new Assignment(this.data).findAllBySession(
            matchingSession
        );
        // Get a unique list of applicant ids
        const applicantIds = Array.from(
            new Set(
                applications
                    .map((x) => x.applicant_id)
                    .concat(assignments.map((x) => x.applicant_id))
            )
        );
        return findAllById(applicantIds, this.ownData);
    }
}

export const applicantsRoutes = {
    get: {
        "/sessions/:session_id/applicants": documentCallback({
            func: (data, params) =>
                new Applicant(data).findAllBySession(params.session_id),
            summary: "Get all applicants associated with the given session",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.applicant),
        }),
        "/applicants": documentCallback({
            func: (data) => new Applicant(data).findAll(),
            summary: "Get all applicants",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.applicant),
        }),
        "/applicants/:applicant_id": documentCallback({
            func: (data, params) =>
                new Applicant(data).find(params.applicant_id),
            summary: "Get an applicant",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.applicant),
        }),
    },
    post: {
        "/applicants": documentCallback({
            func: (data, params, body) => new Applicant(data).upsert(body),
            summary: "Upsert an applicant",
            posts: docApiPropTypes.applicant,
            returns: docApiPropTypes.applicant,
        }),
    },
};
