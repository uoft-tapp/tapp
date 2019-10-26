import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes
} from "../defs/doc-generation";

export const assignmentsRoutes = {
    get: {
        "/sessions/:session_id/assignments": documentCallback({
            func: (data, params) => [...data.assignments[params.session_id]],
            summary: "Get assignments associated with a session",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.assignment)
        })
    },
    post: {}
};
