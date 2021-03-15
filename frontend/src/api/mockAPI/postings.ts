import {
    documentCallback,
    wrappedPropTypes,
    docApiPropTypes,
} from "../defs/doc-generation";

export const postingRoutes = {
    get: {
        "/sessions/:session_id/postings": documentCallback({
            func: () => {
                throw new Error("Not implemented");
            },
            summary: "Get all postings associated with a session",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.posting),
        }),
        "/postings/:posting_id/posting_positions": documentCallback({
            func: () => {
                throw new Error("Not implemented");
            },
            summary: "Get all posting_positions associated with a posting",
            returns: wrappedPropTypes.arrayOf(docApiPropTypes.posting_position),
        }),
        "/postings/:posting_id": documentCallback({
            func: () => {
                throw new Error("Not implemented");
            },
            summary: "Get a single posting",
            returns: docApiPropTypes.posting,
        }),
        "/posting_positions/:posting_position_id": documentCallback({
            func: () => {
                throw new Error("Not implemented");
            },
            summary: "Get a single posting_position",
            returns: docApiPropTypes.posting_position,
        }),
    },
    post: {
        "/sessions/:session_id/postings": documentCallback({
            func: () => {
                throw new Error("Not implemented");
            },
            summary: "Upsert a posting",
            returns: docApiPropTypes.posting,
            posts: docApiPropTypes.posting,
        }),
        "/postings": documentCallback({
            func: () => {
                throw new Error("Not implemented");
            },
            summary: "Upsert a posting",
            returns: docApiPropTypes.posting,
            posts: docApiPropTypes.posting,
        }),
        "/postings/delete": documentCallback({
            func: () => {
                throw new Error("Not implemented");
            },
            summary: "Delete a posting",
            posts: docApiPropTypes.idOnly,
            returns: docApiPropTypes.posting,
        }),
        "/postings/:posting_id/posting_positions": documentCallback({
            func: () => {
                throw new Error("Not implemented");
            },
            summary: "Upsert a posting_position",
            returns: docApiPropTypes.posting_position,
            posts: docApiPropTypes.posting_position,
        }),
        "/posting_positions": documentCallback({
            func: () => {
                throw new Error("Not implemented");
            },
            summary: "Upsert a posting_position",
            returns: docApiPropTypes.posting_position,
            posts: docApiPropTypes.posting_position,
        }),
        "/posting_positions/delete": documentCallback({
            func: () => {
                throw new Error("Not implemented");
            },
            summary: "Delete a posting_position",
            posts: docApiPropTypes.idOnly,
            returns: docApiPropTypes.posting_position,
        }),
    },
};
