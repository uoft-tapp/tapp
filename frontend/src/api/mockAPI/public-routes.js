import { documentCallback, wrappedPropTypes } from "../defs/doc-generation";

export const publicRoutes = {
    get: {
        "/public/ddahs/:token": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Get the contents of ddah as `html` or `pdf`",
            returns: wrappedPropTypes.any,
        }),
        "/public/ddahs/:token/view": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "View a ddah with an accept dialog",
            returns: wrappedPropTypes.any,
        }),
        "/public/contracts/:token": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Get an offer as `html` or `pdf`",
            returns: wrappedPropTypes.any,
        }),
        "/public/contracts/:token/view": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "View an offer with an accept dialog",
            returns: wrappedPropTypes.any,
        }),
        "/public/contracts/:token/details": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Get a JSON object with all the details about the offer",
            returns: wrappedPropTypes.any,
        }),
        "/public/postings/:token": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary:
                "Get a JSON object with the survey_js data for the posting",
            returns: wrappedPropTypes.any,
        }),
        "/public/files/:token": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Return the file corresponding to the specified token",
            returns: wrappedPropTypes.any,
        }),
    },
    post: {
        "/public/ddahs/:ddah_id/accept": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Set a ddah as accepted",
            returns: wrappedPropTypes.any,
        }),
        "/public/contracts/:token/accept": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Accept an offer",
            returns: wrappedPropTypes.any,
        }),
        "/public/contracts/:token/reject": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Reject an offer",
            returns: wrappedPropTypes.any,
        }),
        "/public/postings/:token/submit": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Submit survey_js data after filling out a posting",
            posts: wrappedPropTypes.any,
            returns: wrappedPropTypes.any,
        }),
    },
};
