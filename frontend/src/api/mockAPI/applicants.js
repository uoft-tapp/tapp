import { findAllById } from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";

export const applicantsRoutes = {
    get: {
        "/sessions/:session_id/applicants": documentCallback({
            func: (data, params) =>
                data.applicants_by_session[params.session_id].map(utorid =>
                    findAllById(data.applicants, utorid, "utorid")
                ),
            summary: "Get all applicants associated with the given session",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.applicant)
        })
    },
    post: {}
};
