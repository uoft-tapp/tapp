import { documentCallback } from "../defs/doc-generation";

export const publicRoutes = {
    get: {
        "/public/ddahs/:token": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Get the contents of ddah as `html` or `pdf`",
            returns: {},
        }),
        "/public/ddahs/:token/view": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "View a ddah with an accept dialog",
            returns: {},
        }),
        "/public/contracts/:token": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Get an offer as `html` or `pdf`",
            returns: {},
        }),
        "/public/contracts/:token/view": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "View an offer with an accept dialog",
            returns: {},
        }),
    },
    post: {
        "/public/ddahs/:ddah_id/accept": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Set a ddah as accepted",
            returns: {},
        }),
        "/public/contracts/:token/accept": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Accept an offer",
            returns: {},
        }),
        "/public/contracts/:token/reject": documentCallback({
            func: () => {
                throw new Error("Not implemented in Mock API");
            },
            summary: "Reject an offer",
            returns: {},
        }),
    },
};
