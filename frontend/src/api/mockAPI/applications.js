import { find, getUnusedId, getAttributesCheckMessage } from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";

export const applicationsRoutes = {
    get: {
        "/sessions/:session_id/applications": documentCallback({
            func: (data, params) =>
                data.applications.filter(
                    application =>
                        "" + application.session_id === "" + params.session_id
                ),
            summary: "Get all applications associated with the given session",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.application)
        })
    },
    post: {
        "/applications": documentCallback({
            func: (data, params, body) => {
                const applications = data.applications;
                const application = find(body, applications);
                if (application) {
                    // if we're here, we are updating an existing applicant
                    return Object.assign(application, body);
                }
                // If there is no matching applicant, we need to create one
                // and add it to the current session
                const message = getAttributesCheckMessage(body, applications, {
                    session_id: { required: true },
                    applicant_id: { required: true }
                });
                if (message) {
                    throw new Error(message);
                }
                const newId = getUnusedId(applications);
                const newApplication = { ...body, id: newId };
                // Add the applicant to the list of all applicants
                applications.push(newApplication);
                return newApplication;
            },
            summary: "Upsert an application",
            posts: docApiPropTypes.application,
            returns: docApiPropTypes.application
        })
    }
};
