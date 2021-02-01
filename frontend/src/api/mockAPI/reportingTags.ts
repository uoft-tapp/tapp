import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes,
} from "../defs/doc-generation";

export const reportingTagRoutes = {
    get: {
        "/sessions/:session_id/positions/reporting_tags": documentCallback({
            func: () => {
                throw new Error("Not implemented in mock API");
            },
            summary: "Get all reporting tags associated with a session",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.reportingTag),
        }),
        "/sessions/:session_id/wage_chunks/reporting_tags": documentCallback({
            func: () => {
                throw new Error("Not implemented in mock API");
            },
            summary: "Get all reporting tags associated with a session",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.reportingTag),
        }),
        "/wage_chunks/:wage_chunk_id/reporting_tags": documentCallback({
            func: () => {
                throw new Error("Not implemented in mock API");
            },
            summary: "Get all reporting tags associated with a wage chunk",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.reportingTag),
        }),
        "/positions/:position_id/reporting_tags": documentCallback({
            func: () => {
                throw new Error("Not implemented in mock API");
            },
            summary: "Get all reporting tags associated with a position",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.reportingTag),
        }),
    },
    post: {
        "/wage_chunks/:wage_chunk_id/reporting_tags": documentCallback({
            func: () => {
                throw new Error("Not implemented in mock API");
            },
            summary: "Add a reporting tag associated with a wage chunk",
            returns: docApiPropTypes.reportingTag,
            posts: docApiPropTypes.reportingTag,
        }),
        "/wage_chunks/:wage_chunk_id/reporting_tags/delete": documentCallback({
            func: () => {
                throw new Error("Not implemented in mock API");
            },
            summary:
                "Remove an association between a reporting tag and a wage chunk",
            returns: docApiPropTypes.reportingTag,
            posts: docApiPropTypes.reportingTag,
        }),
        "/positions/:position_id/reporting_tags": documentCallback({
            func: () => {
                throw new Error("Not implemented in mock API");
            },
            summary: "Add a reporting tag associated with a position",
            returns: docApiPropTypes.reportingTag,
            posts: docApiPropTypes.reportingTag,
        }),
        "/positions/:position_id/reporting_tags/delete": documentCallback({
            func: () => {
                throw new Error("Not implemented in mock API");
            },
            summary:
                "Remove an association between a reporting tag and a position",
            returns: docApiPropTypes.reportingTag,
            posts: docApiPropTypes.reportingTag,
        }),
    },
};
