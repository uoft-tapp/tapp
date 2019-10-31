import {
    find,
    getUnusedId,
    getAttributesCheckMessage,
    findAllById
} from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";

export const applicantsRoutes = {
    get: {
        "/sessions/:session_id/applicants": documentCallback({
            func: (data, params) => {
                const applicantIds = findAllById(
                    [params.session_id],
                    data.applications,
                    "session_id"
                ).map(x => x.applicant_id);
                return findAllById(applicantIds, data.applicants);
            },
            summary: "Get all applicants associated with the given session",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.applicant)
        }),
        "/applicants": documentCallback({
            func: data => data.applicants,
            summary: "Get all applicants",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.applicant)
        }),
        "/applicants/:applicant_id": documentCallback({
            func: (data, params) =>
                find({ id: params.applicant_id }, data.applicants),
            summary: "Get an applicant",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.applicant)
        })
    },
    post: {
        "/applicants": documentCallback({
            func: (data, params, body) => {
                const applicants = data.applicants;
                const applicant = find(body, applicants);
                if (applicant) {
                    // if we're here, we are updating an existing applicant
                    return Object.assign(applicant, body);
                }
                // If there is no matching applicant, we need to create one
                // and add it to the current session
                const message = getAttributesCheckMessage(body, applicants, {
                    utorid: { required: true, unique: true },
                    first_name: { required: true },
                    last_name: { required: true }
                });
                if (message) {
                    throw new Error(message);
                }
                const newId = getUnusedId(applicants);
                const newApplicant = { ...body, id: newId };
                // Add the applicant to the list of all applicants
                applicants.push(newApplicant);
                return newApplicant;
            },
            summary: "Upsert an applicant",
            posts: docApiPropTypes.applicant,
            returns: docApiPropTypes.applicant
        })
    }
};
