import {
    getAttributesCheckMessage,
    findAllById,
    MockAPIController,
    filterNullProps,
    errorUnlessRole,
} from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes,
} from "../defs/doc-generation";
import { Session } from "./sessions";
import { Application } from "./applications";
import { Assignment } from "./assignments";
import { stringToNativeType } from "../../libs/urlUtils";
import { Instructor } from "./instructors";

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
            func: (data, params) => {
                if (params.role === "admin") {
                    return new Applicant(data).findAllBySession(
                        params.session_id
                    );
                }
                if (params.role === "instructor") {
                    const activeInstructor = new Instructor(
                        data
                    ).getFromActiveUser();
                    if (!activeInstructor) {
                        return [];
                    }
                    const applicantIds = new Assignment(data)
                        .findAllBySessionAndInstructor(
                            params.session_id,
                            activeInstructor
                        )
                        .map((assignment) => assignment.applicant_id);
                    // Only return applicants for positions that the instructor is instructing
                    return new Applicant(data)
                        .findAll()
                        .filter((applicant) =>
                            applicantIds.includes(applicant.id)
                        );
                }

                errorUnlessRole(params, "");
            },
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
            returns: docApiPropTypes.applicant,
        }),
    },
    post: {
        "/applicants": documentCallback({
            func: (data, params, body) => {
                errorUnlessRole(params, "admin");
                return new Applicant(data).upsert(body);
            },
            summary: "Upsert an applicant",
            posts: docApiPropTypes.applicant,
            returns: docApiPropTypes.applicant,
        }),
        "/sessions/:session_id/applicants": documentCallback({
            func: (data, params, body) => {
                errorUnlessRole(params, "admin");
                const applicants = new Applicant(data).findAll();
                // If we didn't specify an `id` but we did specify a `utorid`,
                // try to look up the applicant by `utorid`
                const existingApplicant =
                    applicants.find(
                        (x) => x.id === body.id || x.utorid === body.utorid
                    ) || {};
                const applicant = new Applicant(data).upsert({
                    ...existingApplicant,
                    ...filterNullProps(body),
                });
                const applications = new Application(data).findAllBySession(
                    params.session_id
                );
                // First search for an applicant with a matching `id`
                let match = applications.find(
                    (application) => application.applicant_id === applicant.id
                );
                if (!match) {
                    // We need to create an application for this applicant
                    new Application(data).upsert({
                        session_id: stringToNativeType(params.session_id),
                        applicant_id: applicant.id,
                        comment: "<Autogenerated>",
                    });
                }

                return applicant;
            },
            summary:
                "Upsert an applicant. If they have no application associated with the current session, an application is created.",
            posts: docApiPropTypes.applicant,
            returns: docApiPropTypes.applicant,
        }),
        "/applicants/delete": documentCallback({
            func: (data, params, body) => {
                errorUnlessRole(params, "admin");
                return new Applicant(data).delete(body);
            },
            summary: "Delete an applicant",
            posts: docApiPropTypes.idOnly,
            returns: docApiPropTypes.applicant,
        }),
    },
};
