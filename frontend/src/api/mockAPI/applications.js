import {
    findAllById
} from "./utils";
import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";

export const applicationsRoutes = {
    get: {
        "/sessions/:session_id/applications": documentCallback({
            func: (data, params) =>
                findAllById(
                    data.applications_by_session[params.session_id],
                    data.applications
                ),
            summary: "Get applications associated with this session.",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.application)
        })
    }
};
